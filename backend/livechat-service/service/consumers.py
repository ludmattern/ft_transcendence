import json
import logging
from .models import ManualUser
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_username(user_id):
	try:
		# Assuming user_id corresponds to ManualUser's primary key.
		user = ManualUser.objects.get(pk=user_id)
		return user.username
	except ManualUser.DoesNotExist:
		return None


class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.channel_layer.group_add("chat_service", self.channel_name)
		logger.info(f"🔗 Connecté au groupe chat_service sur livechat-service (channel: {self.channel_name})")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("chat_service", self.channel_name)
		logger.info("Déconnecté du groupe chat_service")

	async def chat_message(self, event):
		author_id = event.get("author")
		username = await get_username(author_id)

		event["username"] = username

		await self.channel_layer.group_send("gateway", event)
		logger.info(f"Message transmis au groupe gateway depuis chat_service : {event}")
		
