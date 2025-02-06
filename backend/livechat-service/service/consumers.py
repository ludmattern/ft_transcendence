import json
import logging
from .models import ManualUser
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_username(user_id):
	try:
		user = ManualUser.objects.get(pk=user_id)
		return user.username
	except ManualUser.DoesNotExist:
		return None

@database_sync_to_async
def get_id(user_username):
	try:
		user = ManualUser.objects.get(username=user_username)
		return user.id
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
		logger.info(f"Message transmis au groupe gateway depuis chat_service (General): {event}")

	async def private_message(self,event):
		try:	
			logger.info(f"ChatConsumer.private_message received event: {event}")
			author_id = event.get("author")
			username = await get_username(author_id)
			recipient = event.get("recipient")	

			event["username"] = username

			await self.channel_layer.group_send(f"user_{recipient}", event)
			logger.info(f"Message transmis au groupe user_{recipient} depuis chat_service (Private): {event}")
		except Exception as e:
			logger.error(f"Error in private_message handler: {e}")

		
