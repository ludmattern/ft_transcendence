import asyncio
import logging

from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from asgiref.sync import sync_to_async  # type: ignore
from django.db import transaction  # type: ignore
from django.db.models import Q  # type: ignore
from service.models import ManualUser, TournamentMatch, ManualTournamentParticipants, ManualGameHistory
from service.utils import calculate_elo
from .game_manager import game_manager
import time

from .bot import AIPaddle

logger = logging.getLogger(__name__)


class PongGroupConsumer(AsyncWebsocketConsumer):
    running_games = {}

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("pong_service", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("pong_service", self.channel_name)

    async def game_event(self, event):
        """Handle game events."""
        game_id = event.get("game_id")
        action = event.get("action", "")
        player1_id = event.get("player1", "Player 1")
        player2_id = event.get("player2", "Player 2")
        logger.info(f"player1_id: {player1_id}, player2_id: {player2_id} for game_id: {game_id} for action: {action}")
        user_id = event.get("user_id")
        difficulty = event.get("difficulty")
        if action == "leave_game":
            game = game_manager.get_game(game_id)
        else:
            game = game_manager.get_or_create_game(game_id, player1_id, player2_id)
        if action == "start_game":
            if game_id not in self.running_games:
                self.running_games[game_id] = {"task": asyncio.create_task(self.game_loop(game_id, difficulty))}
            payload = game.to_dict()
            await self.channel_layer.group_send(
                f"game_{game_id}",
                {"type": "game_state", "game_id": game_id, "payload": payload},
            )

        elif action in ["start_move", "stop_move"]:
            if game.game_over:
                return
            direction = event.get("direction")
            moving = (action == "start_move")

            if (game.player1_id == "Player 1" and game.player2_id == "Player 2") or game.game_id.startswith("tournLocal_"):
                if game.game_id.startswith("solo_"):
                    game.set_movement(1, direction, moving)
                else:
                    local_player = event.get("local_player")
                    if not local_player:
                        return
                    game.set_movement(local_player, direction, moving)
                return

            else:
                paddle_number = game.player_mapping.get(str(user_id))
                if paddle_number is None:
                    return
                game.set_movement(paddle_number, direction, moving)


        elif action == "game_giveup":
            local_leave = event.get("local_leave")

            if local_leave:
                if int(local_leave) == 1:
                    game.quitter_id = game.player1_id
                elif int(local_leave) == 2:
                    game.quitter_id = game.player2_id
                else:
                    game.quitter_id = user_id 
            else:
                game.quitter_id = user_id 

            game.game_over = True



        elif action == "leave_game":
            current_game = game_manager.get_game(game_id)
            if current_game and current_game.game_over:
                return
            else:
                if game_id in self.running_games:
                    self.running_games[game_id]["task"].cancel()
                    del self.running_games[game_id]
                    game_manager.cleanup_game(game_id)


    async def game_loop(self, game_id, difficulty="hard"):
        """Main game loop."""
        game = game_manager.get_game(game_id)
        try:
            if game.is_solo_mode():
                ai_paddle = AIPaddle(2, game, difficulty=difficulty)
            tick_time = 0.0167  
            next_tick = time.time() + tick_time
            previous_time = time.time()
            
            while True:
                game = game_manager.get_game(game_id)
                if not game:
                    break

                current_time = time.time()
                if current_time >= next_tick:
                    delta_time = current_time - previous_time
                    previous_time = current_time
                    next_tick += tick_time

                    game.update(delta_time)

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
                else:
                    await asyncio.sleep(next_tick - current_time)

        except asyncio.CancelledError:
            if game and game.game_over:
                await self.finalize_game(game_id, game)
            else:
                raise
        finally:
            if game_id in self.running_games:
                del self.running_games[game_id]
            game_manager.cleanup_game(game_id)



    async def determine_winner(self, game):
        """Determine the winner of the game."""
        if game.quitter_id:
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
        """Finalize a tournament game."""
        try:
            winner = await sync_to_async(ManualUser.objects.get)(id=winner_id)
            if not winner:
                logger.warning("No user found")
                return
            loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
            if not loser:
                logger.warning("No user found")
                return

            match = await sync_to_async(
                TournamentMatch.objects.filter(match_key=game_id).first
            )()
            if not match:
                logger.warning(f"No match found with match_key={game_id}")
                return

            tournament_id = match.tournament_id

            participant = await sync_to_async(
                ManualTournamentParticipants.objects.filter(
                    tournament_id=tournament_id, user=loser, status="accepted"
                ).first
            )()
            if participant:
                participant.status = "eliminated"
                await sync_to_async(participant.save)()
            else:
                logger.warning("No participant found")
                return

            match.winner_id = winner.id

            
            if match.player1_id == winner.id:
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
                    match_order=next_match_order
                ).first
            )()
           
            if next_match:
                if match.match_order % 2 == 1:
                    next_match.player1_id = winner.id
                else:
                    next_match.player2_id = winner.id
                await sync_to_async(next_match.save)()

                if next_match.player1_id is not None and next_match.player2_id is not None:
                    next_match.status = "ready"
                    await sync_to_async(next_match.save)()

                    next_match_player_ids = [next_match.player1_id, next_match.player2_id]
                else:
                    next_match_player_ids = []
            else:
                next_match_player_ids = []

            participant_list = await sync_to_async(
                lambda: list(
                    ManualTournamentParticipants.objects.filter(tournament_id=tournament_id)
                    .exclude(Q(status="rejected") | Q(status="left"))
                    .values_list("user_id", flat=True) 
                )
            )()
            if not participant_list:
                logger.warning("No participant list found")
                return


            payload = {
                "type": "info_message",
                "action": "back_tournament_game_over",
                "tournament_id": tournament_id,
                "participant_list": participant_list,
                "next_match_player_ids": next_match_player_ids,
                "current_match_player_ids": [int(winner_id), int(loser_id)],
            }
            await self.channel_layer.group_send(f"user_{0}", payload)

        except Exception as e:
            logger.exception("Error in process_tournament:")


    async def process_matchmaking(self, game_id, game, winner_id, loser_id):
        """finalize matchmaking game."""
        winner = await sync_to_async(ManualUser.objects.get)(id=winner_id)
        if not winner: 
            logger.warning("No user found")
            return
        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
        if not loser:
            logger.warning("No user found")
            return
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
        """Finalize ongoing game."""
        winner_id, loser_id = await self.determine_winner(game)

        if game_id.startswith("tournOnline_"):
            await self.process_tournament(game_id, game, winner_id, loser_id)
            await self.process_matchmaking(game_id, game, winner_id, loser_id)
        elif str(game_id).startswith("matchmaking_"):
            await self.process_matchmaking(game_id, game, winner_id, loser_id)

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
        ):

            await sync_to_async(ManualGameHistory.objects.create)(
                winner_id=winner_id,
                loser_id=loser_id,
                winner_score=game.user_scores.get(winner_id),
                loser_score=game.user_scores.get(loser_id),
            )
            logger.info("Table game history maj")
        else:
            logger.info("Table game history non maj")

    async def game_over(self, event):
        logger.info(f"[PongGroupConsumer] game_over reçu: {event}")

    async def leave_game(self, event):
        logger.info(f"[PongGroupConsumer] leave_game reçu : {event}")
