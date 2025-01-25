import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import game_manager  # Le GameManager côté backend

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Récupérer le game_id depuis l'URL
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f"pong_game_{self.game_id}"

        # Créer ou récupérer la partie dans le GameManager
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
        # Annuler la tâche de mise à jour du jeu si elle est active
        if hasattr(self, 'update_task'):
            self.update_task.cancel()

        # Retirer le joueur du groupe WebSocket
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Optionnel : Nettoyer la partie si tous les joueurs ont quitté
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
        """Boucle qui met à jour l'état du jeu et envoie les mises à jour aux clients."""
        try:
            while True:
                self.game.update()  # Mise à jour régulière (balle, collisions)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "update_game_state"}
                )
                await asyncio.sleep(0.05)  # 20 ticks/s
        except asyncio.CancelledError:
            # La tâche a été annulée (par exemple, à la déconnexion)
            pass
