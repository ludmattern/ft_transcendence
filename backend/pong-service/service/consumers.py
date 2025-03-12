import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from .game_manager import game_manager
from asgiref.sync import sync_to_async  # type: ignore
from django.db import transaction  # type: ignore
from service.models import ManualUser, TournamentMatch, ManualTournamentParticipants
from service.utils import calculate_elo
from django.db.models import Q  # type: ignore
import time
from .bot import ai_decision

logger = logging.getLogger(__name__)

import os
import onnxruntime as ort
import numpy as np

MODEL_PATH = "/app/service/aiModels/pong3d_agent.onnx"

ort_session = ort.InferenceSession(MODEL_PATH)

# now = time.time()
#                 if game.is_solo_mode():
#                     ai_paddle_num = 2
#                     if now - last_ai_time >= 1:
#                         last_ai_time = now
#                         target_y, target_z = ai_decision(game, "Player 2")
#                     paddle = game.state["players"][ai_paddle_num]
#                     threshold = 0.02
#                     if abs(paddle["y"] - target_y) > threshold:
#                         if paddle["y"] < target_y:
#                             game.move_paddle(ai_paddle_num, "up")
#                         elif paddle["y"] > target_y:
#                             game.move_paddle(ai_paddle_num, "down")
#                     if abs(paddle["z"] - target_z) > threshold:
#                         if paddle["z"] < target_z:
#                             game.move_paddle(ai_paddle_num, "right")
#                         elif paddle["z"] > target_z:
#                             game.move_paddle(ai_paddle_num, "left")


def predict_ai_action(obs):
    obs = np.array(obs, dtype=np.float32).reshape(1, -1)
    try:
        action_outputs = ort_session.run(None, {"input": obs})
        if isinstance(action_outputs, list) and len(action_outputs) > 0:
            main_action = action_outputs[0]

            if main_action.shape == (1, 2):  # ✅ Cas normal (batch=1, deux valeurs)
                target_y, target_z = float(main_action[0][0]), float(main_action[0][1])
            elif main_action.shape == (2,):  # Cas rare (directement 2 valeurs sans batch)
                target_y, target_z = float(main_action[0]), float(main_action[1])
            else:
                target_y, target_z = 0.0, 0.0

            logger.info(f"🤖 AI action: (target_y={target_y}, target_z={target_z})")
            return target_y, target_z

        else:
            return 0.0, 0.0  # 🔴 Sécurité

    except Exception as e:
        logger.exception("🚨 Error during AI action prediction")
        return 0.0, 0.0  # 🔴 Fallback en cas d'erreur


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

        await self.channel_layer.group_add(f"game_{game_id}", self.channel_name)
        game = game_manager.get_or_create_game(game_id, player1_id, player2_id)

        if action == "start_game":
            if game_id not in self.running_games:
                logger.info(f"🎮 Démarrage de la partie {game_id}")
                self.running_games[game_id] = {"task": asyncio.create_task(self.game_loop(game_id))}

            payload = game.to_dict()
            await self.channel_layer.group_send(f"game_{game_id}", {"type": "game_state", "game_id": game_id, "payload": payload})

        elif action == "move":
            direction = event.get("direction")
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

        elif action == "leave_game":
            if game_id in self.running_games:
                self.running_games[game_id]["task"].cancel()
                del self.running_games[game_id]
                game_manager.cleanup_game(game_id)

        elif action == "game_giveup":
            game.quitter_id = user_id
            game.game_over = True

    async def game_state(self, event):
        pass

    async def get_user_status(self, player_id):
        user = await sync_to_async(ManualUser.objects.get)(id=player_id)
        return user.status

    async def game_loop(self, game_id):
        target_y = 0.0
        target_z = 0.0
        stop_event = asyncio.Event()
        game = game_manager.get_game(game_id)

        try:
            last_ai_time = time.time()
            while True:
                game = game_manager.get_game(game_id)
                if not game:
                    break

                game.update()

                now = time.time()
                if game.is_solo_mode():
                    ai_paddle_num = 2
                    ai_player_id = "Player 2"
                    if now - last_ai_time >= 1:
                        last_ai_time = now

                        obs = [
                            game.state.ball.position.x,
                            game.state.ball.position.y,
                            game.state.ball.position.z,
                            game.state.ball.velocity.x,
                            game.state.ball.velocity.y,
                            game.state.ball.velocity.z,
                            game.state.players[1].paddle_position.y,
                            game.state.players[1].paddle_position.z,
                            game.state.players[2].paddle_position.y,
                            game.state.players[2].paddle_position.z,
                        ]
                        target_y, target_z = predict_ai_action(obs)

                    current_y = game.state.players[ai_paddle_num].paddle_position.y
                    current_z = game.state.players[ai_paddle_num].paddle_position.z


                    if target_y > current_y:
                        game.move_paddle(ai_paddle_num, "up")
                    elif target_y < current_y:
                        game.move_paddle(ai_paddle_num, "down")

                    if target_z > current_z:
                        game.move_paddle(ai_paddle_num, "right")
                    elif target_z < current_z:
                        game.move_paddle(ai_paddle_num, "left")

                payload = game.to_dict()

                await self.channel_layer.group_send(
                    f"game_{game_id}", {"type": "game_state", "game_id": game_id, "payload": payload}
                )
                from .models import GameHistory

                if game.game_over:
                    if game.quitter_id:
                        if game.quitter_id == game.player1_id:
                            winner_id = game.player2_id
                            loser_id = game.player1_id
                        else:
                            winner_id = game.player1_id
                            loser_id = game.player2_id
                    elif game.user_scores[game.player1_id] > game.user_scores[game.player2_id]:
                        winner_id = game.player1_id
                        loser_id = game.player2_id
                    else:
                        winner_id = game.player2_id
                        loser_id = game.player1_id
                    logger.info(f"winner_id: {winner_id}")
                    logger.info(f"loser_id: {loser_id}")

                    if game_id.startswith("tournOnline_"):
                        winner = await sync_to_async(ManualUser.objects.get)(id=winner_id)
                        loser = await sync_to_async(ManualUser.objects.get)(id=loser_id)
                        match = await sync_to_async(TournamentMatch.objects.filter(match_key=game_id).first)()

                        tournament_id = match.tournament_id

                        participant = await sync_to_async(
                            ManualTournamentParticipants.objects.filter(
                                tournament_id=tournament_id, user=loser, status="accepted"
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
                                    tournament_id=tournament_id, round_number=next_round, match_order=next_match_order
                                ).first
                            )()

                        if next_match:
                            winner_username = await sync_to_async(lambda: ManualUser.objects.get(id=int(winner_id)).username)()

                            if match.match_order % 2 == 1:
                                next_match.player1 = winner_username
                            else:
                                next_match.player2 = winner_username
                            await sync_to_async(next_match.save)()

                        # *******************over game over au live chat ***********************
                        next_match_player_ids = []
                        if next_match:
                            if next_match.player1 != "TBD" and next_match.player2 != "TBD":
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

                    if str(game_id).startswith("matchmaking_"):
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

    async def leave_game(self, event):
        logger.info(f"[PongGroupConsumer] leave_game reçu : {event}")
