import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import game_manager  # Le GameManager côté backend

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f"pong_game_{self.game_id}"

        self.game = game_manager.get_or_create_game(self.game_id)

        # Ajouter le joueur au groupe WebSocket
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accepter la connexion WebSocket
        await self.accept()

        # Démarrer une tâche pour la boucle du jeu
        self.update_task = asyncio.create_task(self.game_loop())

        # Envoyer l'état initial de la partie
        await self.send(json.dumps({
            "type": "game_state",
            "payload": self.game.to_dict()
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'update_task'):
            self.update_task.cancel()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        game_manager.cleanup_game(self.game_id)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "move":
            direction = data.get("direction")
            player_id = data.get("player_id", 1)
            # Déplacement raquette
            self.game.move_paddle(player_id, direction)
            # Mise à jour immédiate et diffusion de l'état
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "update_game_state"}
            )

    async def update_game_state(self, event):
        await self.send(json.dumps({
            "type": "game_state",
            "payload": self.game.to_dict()
        }))

    async def game_loop(self):
        try:
            while True:
                self.game.update()  # Mise à jour régulière
                # Diffuser l'état du jeu
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "update_game_state"}
                )

                # Si la partie est terminée
                if self.game.game_over:
                    # Envoyer un message de fin
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {"type": "game_over"}
                    )
                    break  # On sort de la boucle => arrête la mise à jour

                await asyncio.sleep(0.02)  # 20 ticks/s
        except asyncio.CancelledError:
            pass

    async def game_over(self, event):
        """Notifier le client que la partie est terminée."""
        # Tu peux calculer quel joueur a gagné en regardant les scores
        scores = self.game.state["scores"]
        winner = 1 if scores[1] >= self.game.max_score else 2

        await self.send(json.dumps({
            "type": "game_over",
            "winner": winner,
            "final_scores": scores
        }))

        # On peut ensuite fermer la WebSocket côté serveur
        await self.close()