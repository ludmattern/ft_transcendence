import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger(__name__)

class GatewayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Connexion du client WebSocket au Gateway."""
        await self.accept()
        self.userID = self.scope['user'].userID if self.scope['user'].is_authenticated else "guest"

        # Ajouter l'utilisateur au groupe `gateway` pour recevoir des messages du chat-service
        await self.channel_layer.group_add("gateway", self.channel_name)

        logger.info(f"🔗 Client {self.userID} connecté au WebSocket Gateway")

    async def disconnect(self, close_code):
        """Déconnexion du client WebSocket"""
        await self.channel_layer.group_discard("gateway", self.channel_name)

        logger.info(f"Client {self.userID} déconnecté")

    async def receive(self, text_data):
        """Envoie tous les messages reçus au `chat-service`"""
        try:
            data = json.loads(text_data)

            event_type = data.get("type")
            if not event_type:
                await self.send(json.dumps({"error": "Type de message non spécifié"}))
                return

            # Rediriger le message vers `chat-service`
            await self.channel_layer.group_send(
                "chat_service",
                data
            )
            logger.info(f"Message relayé à `chat-service` depuis {self.userID}")

        except json.JSONDecodeError:
            await self.send(json.dumps({"error": "Format JSON invalide"}))

    async def chat_message(self, event):
        """Recevoir un message du `chat-service` et l'envoyer au client WebSocket."""
        await self.send(json.dumps(event))
        logger.info(f"Message transmis au client WebSocket : {event}")
