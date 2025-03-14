import asyncio
import logging
import time

from .models import GameHistory

from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from asgiref.sync import sync_to_async  # type: ignore
from django.db import transaction  # type: ignore
from django.db.models import Q  # type: ignore
from service.models import ManualUser, TournamentMatch, ManualTournamentParticipants
from service.utils import calculate_elo
from .game_manager import game_manager

from .bot import AIPaddle

logger = logging.getLogger(__name__)


class PongGroupConsumer(AsyncWebsocketConsumer):
    running_games = {}

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("pong_service", self.channel_name)
        logger.info(f"🔗 Connecté au groupe 'pong_service' (channel={self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("pong_service", self.channel_name)

    async def game_event(self, event):
        logger.info(f"[PongGroupConsumer] Reçu un game_event: {event}")

        game_id = event.get("game_id")
        action = event.get("action", "")
        player1_id = event.get("player1", "Player 1")
        player2_id = event.get("player2", "Player 2")
        user_id = event.get("user_id")

        game = game_manager.get_or_create_game(game_id, player1_id, player2_id)
        if action == "start_game":
            if game_id not in self.running_games:
                logger.info(f"🎮 Démarrage de la partie {game_id}")
                self.running_games[game_id] = {"task": asyncio.create_task(self.game_loop(game_id))}
            payload = game.to_dict()
            await self.channel_layer.group_send(
                f"game_{game_id}",
                {"type": "game_state", "game_id": game_id, "payload": payload},
            )

        elif action == "move":
            # On ignore les mouvements si le jeu est terminé
            if game.game_over:
                logger.info(f"Déplacement ignoré : la partie {game_id} est terminée.")
                return

            direction = event.get("direction")
            # Cas particulier pour une partie solo ou tournoi local
            if game.player1_id == "Player 1" and game.player2_id == "Player 2" or game.game_id.startswith("tournLocal_"):
                if game.game_id.startswith("solo_"):
                    game.move_paddle(1, direction)
                local_player = event.get("local_player")
                if not local_player:
                    return
                game.move_paddle(local_player, direction)
                return
            else:
                logger.info(f"🎮 Déplacement du joueur {user_id} ({direction})")
                paddle_number = game.player_mapping.get(str(user_id))
                logger.info(f"player_mapping: {game.player_mapping}")
                if paddle_number is None:
                    logger.error(
                        "Le champ indiquant le joueur (local_player ou user_id) ne correspond à aucun paddle dans la partie."
                    )
                    return
                game.move_paddle(paddle_number, direction)

        elif action == "game_giveup":
            game.quitter_id = user_id
            game.game_over = True

        elif action == "leave_game":
            current_game = game_manager.get_game(game_id)
            if current_game and current_game.game_over:
                logger.info(f"Partie {game_id} déjà terminée, leave_game ignoré.")
            else:
                if game_id in self.running_games:
                    logger.info(f"Annulation de game_loop pour {game_id} suite à leave_game")
                    self.running_games[game_id]["task"].cancel()
                    del self.running_games[game_id]
                    game_manager.cleanup_game(game_id)

    async def get_user_status(self, player_id):
        user = await sync_to_async(ManualUser.objects.get)(id=player_id)
        return user.status

    async def game_loop(self, game_id):
        target_y = 0.0
        target_z = 0.0
        game = game_manager.get_game(game_id)
        try:
            last_ai_time = time.time()
            ai_paddle = AIPaddle(2, game, difficulty="easy")

            while True:
                game = game_manager.get_game(game_id)
                if not game:
                    break

                game.update()

                if game.game_over:
                    try:
                        await self.finalize_game(game_id, game)
                    except asyncio.CancelledError:
                        await self.finalize_game(game_id, game)
                    break
                

                if game.is_solo_mode():
                    ai_paddle.update()  

                payload = game.to_dict()
                await self.channel_layer.group_send(
                    f"game_{game_id}",
                    {"type": "game_state", "game_id": game_id, "payload": payload},
                )
                await asyncio.sleep(0.0167)

        except asyncio.CancelledError:
            # Si la tâche est annulée alors que le jeu est terminé, on lance la finalisation
            if game and game.game_over:
                await self.finalize_game(game_id, game)
            else:
                raise
        finally:
            if game_id in self.running_games:
                del self.running_games[game_id]
            game_manager.cleanup_game(game_id)

    # --- Fonctions de finalisation et traitement des parties ---

    async def determine_winner(self, game):
        if game.quitter_id:
            # Affecte -1 au score du joueur qui a abandonné
            game.user_scores[game.quitter_id] = -1
            if game.quitter_id == game.player1_id:
                return game.player2_id, game.player1_id
            else:
                return game.player1_id, game.player2_id
        elif game.user_scores[game.player1_id] > game.user_scores[game.player2_id]:
            return game.player1_id, game.player2_id
        else:
            return game.player2_id, game.player1_id

    async def process_tournament(self, game_id, game, winner_id, loser_id):
        """
        Traite la finalisation spécifique aux tournois en ligne.
        Met à jour les statuts, le score et prépare le prochain match.
        """
        winner = await sync_to_async(ManualUser.objects.get)(id=winner_id)
        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
        match = await sync_to_async(TournamentMatch.objects.filter(match_key=game_id).first)()
        tournament_id = match.tournament_id

        participant = await sync_to_async(
            ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, user=loser, status="accepted").first
        )()
        if participant:
            participant.status = "eliminated"
            await sync_to_async(participant.save)()

        if match:
            match.winner = str(winner_id)
            if match.player1 == winner.username:
                match.score = f"{game.user_scores[winner_id]}-{game.user_scores[loser_id]}"
            else:
                match.score = f"{game.user_scores[loser_id]}-{game.user_scores[winner_id]}"
            match.status = "completed"
            await sync_to_async(match.save)()

            next_round = match.round_number + 1
            next_match_order = (match.match_order + 1) // 2
            next_match = await sync_to_async(
                TournamentMatch.objects.filter(
                    tournament_id=tournament_id, round_number=next_round, match_order=next_match_order
                ).first
            )()
        else:
            next_match = None

        if next_match:
            winner_username = await sync_to_async(lambda: ManualUser.objects.get(id=int(winner_id)).username)()
            if match.match_order % 2 == 1:
                next_match.player1 = winner_username
            else:
                next_match.player2 = winner_username
            await sync_to_async(next_match.save)()

        next_match_player_ids = []
        if next_match and next_match.player1 != "TBD" and next_match.player2 != "TBD":
            next_match_player_ids = await sync_to_async(
                lambda: [
                    ManualUser.objects.get(username=next_match.player1).id,
                    ManualUser.objects.get(username=next_match.player2).id,
                ]
            )()
            next_match.status = "ready"
            await sync_to_async(next_match.save)()

        participant_list = await sync_to_async(
            lambda: list(
                ManualTournamentParticipants.objects.filter(tournament_id=tournament_id)
                .exclude(Q(status="rejected") | Q(status="left"))
                .values_list("id", flat=True)
            )
        )()

        payload = {
            "type": "info_message",
            "action": "back_tournament_game_over",
            "tournament_id": tournament_id,
            "participant_list": participant_list,
            "next_match_player_ids": next_match_player_ids,
            "current_match_player_ids": [int(winner_id), int(loser_id)],
        }
        logger.info(f"back_tournament_game_over sent to gateway: {payload}")
        await self.channel_layer.group_send(f"user_{0}", payload)

    async def process_matchmaking(self, game_id, game, winner_id, loser_id):
        """
        Traite la finalisation spécifique au matchmaking : met à jour les ELOs.
        """
        winner = await sync_to_async(ManualUser.objects.get)(id=winner_id)
        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
        logger.info(f"winner elo: {winner.id}")
        if winner.elo == 0:
            winner.elo = 1000
            await sync_to_async(winner.save)()
        if loser.elo == 0:
            loser.elo = 1000
            await sync_to_async(loser.save)()
        new_winner_elo, new_loser_elo = calculate_elo(winner.elo, loser.elo)

        def update_elo():
            with transaction.atomic():
                winner.elo = new_winner_elo
                loser.elo = new_loser_elo
                winner.save()
                loser.save()

        await sync_to_async(update_elo)()

    async def finalize_game(self, game_id, game):
        """
        Finalisation de la partie : calcul du vainqueur, mise à jour des scores,
        ELO et historique de partie (et autres cas spécifiques comme tournoi).
        """
        winner_id, loser_id = await self.determine_winner(game)
        logger.info(f"winner_id: {winner_id}")
        logger.info(f"loser_id: {loser_id}")

        if game_id.startswith("tournOnline_"):
            await self.process_tournament(game_id, game, winner_id, loser_id)
        elif str(game_id).startswith("matchmaking_"):
            await self.process_matchmaking(game_id, game, winner_id, loser_id)

        # Envoi de l'événement de fin de partie à tous les clients concernés
        await self.channel_layer.group_send(
            f"game_{game_id}",
            {
                "type": "game_over",
                "game_id": str(game_id),
                "winner_id": winner_id,
                "loser_id": loser_id,
                "final_scores": game.user_scores,
            },
        )
        await asyncio.sleep(0.01)

        # Mise à jour de l'historique si le game_id ne correspond pas à un type particulier
        if not (
            str(game_id).startswith("game_")
            or str(game_id).startswith("tournLocal_")
            or str(game_id).startswith("solo_")
        ):

            await sync_to_async(GameHistory.objects.create)(
                winner_id=winner_id,
                loser_id=loser_id,
                winner_score=game.user_scores.get(winner_id),
                loser_score=game.user_scores.get(loser_id),
            )
            logger.info("table game history maj")
        else:
            logger.info("table game history non maj")

    async def game_over(self, event):
        """Gère la fin de partie."""
        logger.info(f"[PongGroupConsumer] game_over reçu: {event}")

    async def leave_game(self, event):
        logger.info(f"[PongGroupConsumer] leave_game reçu : {event}")
