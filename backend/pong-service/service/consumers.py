import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import game_manager

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

       # logger.info(f"[PongGroupConsumer] Reçu un game_event: {event}")

        game_id = event.get("game_id")
        action = event.get("action", "")
        player1_id = event.get("player1", "Player 1")
        player2_id = event.get("player2", "Player 2")
        await self.channel_layer.group_add(f"game_{game_id}", self.channel_name)
        #logger.info(f"Client ajouté au groupe game_{game_id}")

        game = game_manager.get_or_create_game(game_id, player1_id, player2_id)
        logger.info(f"🎮 Game récupérée: {game_id}, Player1={game.player1_id}, Player2={game.player2_id}")

        if action == "start_game":
            if game_id not in self.running_games:
                task = asyncio.create_task(self.game_loop(game_id))
                self.running_games[game_id] = task
               # logger.info(f" Boucle de jeu démarrée pour game_id={game_id}")

            payload = game.to_dict()
            await self.channel_layer.group_send(
                f"game_{game_id}",
                {
                    "type": "game_state",
                    "game_id": game_id,
                    "payload": payload
                }
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
       
        #logger.info(f"[PongGroupConsumer] game_state reçu pour {event.get('game_id')}")

        pass

    async def game_loop(self, game_id):
        """
        Boucle régulière de mise à jour. Tourne tant que la partie n'est pas finie.
        """
        #logger.info(f" game_loop démarrée pour {game_id}")
        try:
            while True:
                game = game_manager.get_game(game_id)
                if not game:
                    #logger.warning(f"Game {game_id} introuvable, on quitte la boucle.")
                    break

                game.update()
                payload = game.to_dict()

                await self.channel_layer.group_send(
                    f"game_{game_id}",
                    {
                        "type": "game_state",
                        "game_id": game_id,
                        "payload": payload
                    }
                )

                if game.game_over:
                    if game.user_scores[game.player1_id] >= game.max_score:
                        winner_id = game.player1_id
                        loser_id = game.player2_id
                    else:
                        winner_id = game.player2_id
                        loser_id = game.player1_id

                    await self.channel_layer.group_send(
                        f"game_{game_id}",
                        {
                            "type": "game_over",
                            "game_id": str(game_id),
                            "winner_id": winner_id,
                            "loser_id": loser_id,
                            "final_scores": game.user_scores
                        }
                    )
                    game_manager.cleanup_game(game_id)
                   # logger.info(f"Partie {game_id} terminée (game_over)")
                    break

                await asyncio.sleep(0.01)

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