import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from .game_manager import game_manager
from asgiref.sync import sync_to_async  # type: ignore
from django.db import transaction  # type: ignore
from service.models import ManualUser, TournamentMatch, ManualTournamentParticipants
from service.utils import calculate_elo
from django.db.models import Q  # type: ignore


# import numpy as np
logger = logging.getLogger(__name__)
# from stable_baselines3 import PPO


# ODEL_PATH = "/app/service/aiModels/pong3d_agent.zip"
# model = PPO.load(MODEL_PATH)


# def get_obs(game):
#     """
#     Construit l'observation sous forme (1, 10) avec np.float32.
#     """
#     ball = game.state["ball"]
#     p1 = game.state["players"][1]
#     p2 = game.state["players"][2]

#     arr = np.array([
#         ball["x"], ball["y"], ball["z"],
#         ball["vx"], ball["vy"], ball["vz"],
#         p1["y"], p1["z"],
#         p2["y"], p2["z"]
#     ], dtype=np.float32)

#     return arr.reshape(1, -1)  # => Toujours (1, 10)

# def action_to_direction(action):
#     """
#     Convertit l'action (0..4) en 'up','down','left','right' ou None (stay).
#     """
#     if action == 1:
#         return "up"
#     elif action == 2:
#         return "down"
#     elif action == 3:
#         return "left"
#     elif action == 4:
#         return "right"
#     else:
#         return None


class PongGroupConsumer(AsyncWebsocketConsumer):
    running_games = {}

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("pong_service", self.channel_name)
        logger.info(
            f"🔗 Connecté au groupe 'pong_service' (channel={self.channel_name})"
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("pong_service", self.channel_name)

    async def game_event(self, event):
        # logger.info(f"[PongGroupConsumer] Reçu un game_event: {event}")

        game_id = event.get("game_id")
        action = event.get("action", "")
        player1_id = event.get("player1", "Player 1")
        player2_id = event.get("player2", "Player 2")
        logger.info(
            f"🚀 Envoi à pong_service: game_id={game_id}, player1={player1_id}, player2={player2_id}"
        )
        await self.channel_layer.group_add(f"game_{game_id}", self.channel_name)
        # logger.info(f"Client ajouté au groupe game_{game_id}")

        game = game_manager.get_or_create_game(game_id, player1_id, player2_id)
        # logger.info(f"🎮 Game récupérée: {game_id}, Player1={game.player1_id}, Player2={game.player2_id}")

        if action == "start_game":
            if game_id not in self.running_games:
                self.running_games[game_id] = {
                    "task": asyncio.create_task(self.game_loop(game_id)),
                }

            payload = game.to_dict()
            await self.channel_layer.group_send(
                f"game_{game_id}",
                {"type": "game_state", "game_id": game_id, "payload": payload},
            )

        elif action == "move":
            direction = event.get("direction")
            player_id = event.get("player_id")

            game.move_paddle(player_id, direction)

        elif action == "leave_game":
            if game_id in self.running_games:
                self.running_games[game_id].cancel()
                del self.running_games[game_id]
                game_manager.cleanup_game(game_id)
                logger.info(f" Partie {game_id} terminée (leave_game)")

    async def game_state(self, event):
        # logger.info(f"[PongGroupConsumer] game_state reçu pour {event.get('game_id')}")

        pass

    # async def _bot_action(self, game, game_id):
    #     """
    #     Fait agir l'IA pour player2 si c'est un match solo.
    #     """
    #     obs = get_obs(game)

    #     action, _states = model.predict(obs, deterministic=True)
    #     direction = action_to_direction(action)

    #     if direction:
    #         logger.info(f"🎮 dir: {direction}, {game.player2_id}")
    #         self.running_games[game_id]["bot_last_action"] = direction

    async def game_loop(self, game_id):
        """
        Boucle régulière de mise à jour. Tourne tant que la partie n'est pas finie.
        """

        try:
            # is_solo_mode = game_id.startswith("solo_")  # ou "solo" in game_id
            # ai_interval = 1.0   # IA agit toutes les 1s
            # last_ai_time = time.time()
            while True:
                game = game_manager.get_game(game_id)
                if not game:
                    # logger.warning(f"Game {game_id} introuvable, on quitte la boucle.")
                    break

                game.update()

                # if is_solo_mode:
                #     now = time.time()

                #     if now - last_ai_time >= ai_interval:
                #         await self._bot_action(game, game_id)
                #         last_ai_time = now

                #     bot_last_action = self.running_games[game_id]["bot_last_action"]
                #     if bot_last_action:
                #         game.move_paddle(1, bot_last_action)

                payload = game.to_dict()

                await self.channel_layer.group_send(
                    f"game_{game_id}",
                    {"type": "game_state", "game_id": game_id, "payload": payload},
                )
                from .models import GameHistory

                if game.game_over:
                    if game.user_scores[game.player1_id] >= game.max_score:
                        winner_id = game.player1_id
                        loser_id = game.player2_id
                    else:
                        winner_id = game.player2_id
                        loser_id = game.player1_id
                    logger.info(f"winner_id: {winner_id}")
                    logger.info(f"loser_id: {loser_id}")

                    if game_id.startswith("tournOnline_"):
                        winner = await sync_to_async(ManualUser.objects.get)(
                            id=winner_id
                        )
                        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
                        match = await sync_to_async(
                            TournamentMatch.objects.filter(match_key=game_id).first
                        )()

                        tournament_id = match.tournament_id

                        participant = await sync_to_async(
                            ManualTournamentParticipants.objects.filter(
                                tournament_id=tournament_id,
                                user=loser,
                                status="accepted",
                            ).first
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
                                    tournament_id=tournament_id,
                                    round_number=next_round,
                                    match_order=next_match_order,
                                ).first
                            )()

                        if next_match:
                            winner_username = await sync_to_async(
                                lambda: ManualUser.objects.get(
                                    id=int(winner_id)
                                ).username
                            )()

                            if match.match_order % 2 == 1:
                                next_match.player1 = winner_username
                            else:
                                next_match.player2 = winner_username
                            await sync_to_async(next_match.save)()

                        # *******************over game over au live chat ***********************
                        next_match_player_ids = []
                        if next_match:
                            if (
                                next_match.player1 != "TBD"
                                and next_match.player2 != "TBD"
                            ):
                                next_match_player_ids = await sync_to_async(
                                    lambda: [
                                        ManualUser.objects.get(
                                            username=next_match.player1
                                        ).id,
                                        ManualUser.objects.get(
                                            username=next_match.player2
                                        ).id,
                                    ]
                                )()
                                next_match.status = "ready"
                                await sync_to_async(next_match.save)()

                        participant_list = await sync_to_async(
                            lambda: list(
                                ManualTournamentParticipants.objects.filter(
                                    tournament_id=tournament_id
                                )
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

                        logger.info(
                            f"back_tournament_game_over sent to gateway: {payload}"
                        )
                        await self.channel_layer.group_send(f"user_{0}", payload)

                    if str(game_id).startswith("matchmaking_"):
                        winner = await sync_to_async(ManualUser.objects.get)(
                            id=winner_id
                        )
                        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)

                        logger.info(f"winner elo: {winner.id}")
                        if winner.elo == 0:
                            winner.elo = 1000
                            await sync_to_async(winner.save)()
                        if loser.elo == 0:
                            loser.elo = 1000
                            await sync_to_async(loser.save)()

                        new_winner_elo, new_loser_elo = calculate_elo(
                            winner.elo, loser.elo
                        )

                        def elo():
                            with transaction.atomic():
                                winner.elo = new_winner_elo
                                loser.elo = new_loser_elo

                                winner.save()
                                loser.save()

                        await sync_to_async(elo)()

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
                    
                    if not (
                        str(game_id).startswith("game_")
                        or str(game_id).startswith("tournLocal_")
                        or str(game_id).startswith("solo_")
                        or str(game_id).startswith("tournOnline_")
                    ):
                        await sync_to_async(GameHistory.objects.create)(
                            winner_id=winner_id,
                            loser_id=loser_id,
                            winner_score=game.user_scores.get(winner_id),
                            loser_score=game.user_scores.get(loser_id),
                        )
                        logger.info("table game history maj")

                    # logger.info(f"Partie {game_id} terminée (game_over)")
                    break

                await asyncio.sleep(0.0167)

        except asyncio.CancelledError:
            logger.info(f"game_loop annulée pour {game_id}")
        finally:
            if game_id in self.running_games:
                del self.running_games[game_id]
            game_manager.cleanup_game(game_id)
        # logger.info(f"game_loop fermée pour {game_id}")

    async def game_over(self, event):
        """Gère la fin de partie."""

    # logger.info(f"[PongGroupConsumer] game_over reçu: {event}")
