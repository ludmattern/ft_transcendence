import logging
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore

logger = logging.getLogger(__name__)

class AuthConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("auth_service", self.channel_name)
        logger.info("Connecté au groupe auth_service (channel: %s)", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("auth_service", self.channel_name)
        logger.info("Déconnecté du groupe auth_service")

    async def logout_message(self, event):
        await self.send_json({
            "type": "z",
            "message": "Your session has been invalidated.",
        })
