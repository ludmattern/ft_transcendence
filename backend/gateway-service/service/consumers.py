import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class GatewayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.user_id = self.scope["user"].id if self.scope.get("user") and self.scope["user"].is_authenticated else "guest"
        await self.channel_layer.group_add("gateway", self.channel_name)
        logger.info(f"🔗 Client {self.user_id} connecté au WebSocket Gateway")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("gateway", self.channel_name)
        logger.info(f"Client {self.user_id} déconnecté du Gateway")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get("type") != "chat_message":
                await self.send(json.dumps({"error": "Type de message non supporté"}))
                return

            event = {
                "type": "chat_message",  # Ceci va appeler la méthode chat_message dans le ChatConsumer
                "sender_id": data.get("sender_id"),
                "message": data.get("message"),
                "timestamp": data.get("timestamp")
            }

            await self.channel_layer.group_send("chat_service", event)
            logger.info(f"Message relayé à 'chat_service' depuis {self.user_id}")
        except json.JSONDecodeError:
            await self.send(json.dumps({"error": "Format JSON invalide"}))

    async def chat_message(self, event):
        """Reçoit un message (provenant du chat-service) et le renvoie au client."""
        await self.send(json.dumps(event))
        logger.info(f"Message transmis au client WebSocket : {event}")
