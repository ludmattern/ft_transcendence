import logging
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore

logger = logging.getLogger(__name__)


class AuthConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            await self.accept()
            await self.channel_layer.group_add("auth_service", self.channel_name)
            logger.info("Connected to auth_service (channel: %s)", self.channel_name)
        except Exception as e:
            logger.exception("Failed to connect to auth_service: %s", e)
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard("auth_service", self.channel_name)
            logger.info("Disconnected from auth_service")
        except Exception as e:
            logger.exception("Failed to disconnect from auth_service: %s", e)

    async def logout_message(self, event):
        try:
            await self.send_json({"type": "z", "message": "Your session has been invalidated."})
        except Exception as e:
            logger.exception("Failed to send logout message: %s", e)
