import asyncio
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

logger = logging.getLogger(__name__)

class AuthConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.channel_layer.group_add("auth_service", self.channel_name)
		logger.info(f"🔗 Connecté au groupe auth_service (channel: {self.channel_name})")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("auth_service", self.channel_name)
		logger.info("Déconnecté du groupe auth_service")

	async def logout_message(self, event):
		return
