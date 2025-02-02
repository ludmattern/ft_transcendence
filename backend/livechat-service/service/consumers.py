import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("chat_service", self.channel_name)
        logger.info(f"🔗 Connecté au groupe chat_service sur livechat-service (channel: {self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat_service", self.channel_name)
        logger.info("Déconnecté du groupe chat_service")

    async def chat_message(self, event):
        await self.channel_layer.group_send("gateway", event)
        logger.info(f"Message transmis au groupe gateway depuis chat_service : {event}")
