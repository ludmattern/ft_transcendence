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
    user = ManualUser.objects.filter(username=user_username).first()
    if user:
        return user.id
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

	async def private_message(self, event):
		logger.info(f"ChatConsumer.private_message received event: {event}")
		
		author_id = event.get("author")
		username = await get_username(author_id)
		recipient = event.get("recipient")
		recipient_id = await get_id(recipient)

		if recipient_id is None:
			logger.info(f"No valid recipient id for recipient: {recipient}")
			event["type"] = "error_message"
			event["message"] = "Recipient does not exist"
			event["username"] = username
			await self.channel_layer.group_send(f"user_{author_id}", event)
			return

		if str(author_id) == str(recipient_id):
			logger.info(f"Skipping message sending because author_id ({author_id}) equals recipient_id ({recipient_id})")
			return

		event["username"] = username

		await self.channel_layer.group_send(f"user_{recipient_id}", event)
		await self.channel_layer.group_send(f"user_{author_id}", event)
		logger.info(f"Message transmitted to groups user_{recipient_id} and user_{author_id}: {event}")

		
