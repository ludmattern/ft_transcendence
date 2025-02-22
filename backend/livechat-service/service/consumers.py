import json
import logging
from .models import ManualUser
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db.models import Q
from .models import ManualUser, ManualFriendsRelations

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

@database_sync_to_async
def get_users_id():
	return list(ManualUser.objects.values_list('id', flat=True))

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
		users = await get_users_id()  

		for userid in users:
			if userid != author_id:
				await self.channel_layer.group_send(f"user_{userid}", event)
		logger.info(f"Message transmis aux active users depuis chat_service (General): {event}")


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

		event["recipient_id"] = recipient_id

		if str(author_id) == str(recipient_id):
			logger.info(f"Skipping message sending because author_id ({author_id}) equals recipient_id ({recipient_id})")
			return

		event["username"] = username

		await self.channel_layer.group_send(f"user_{recipient_id}", event)
		await self.channel_layer.group_send(f"user_{author_id}", event)
		logger.info(f"Message transmitted to groups user_{recipient_id} and user_{author_id}: {event}")


	async def info_message(self, event):
		"""Send a friend request or accept an existing one if initiated by the other user."""
		logger.info(f"ChatConsumer.send_friend_request received event: {event}")

		action = event.get("action")
		author_id = event.get("author")
		recipient_id = event.get("recipient")

		if str(action) == "send_friend_request":
			if not author_id or not recipient_id:
				await self.channel_layer.group_send(
					f"user_{author_id}",
					{"type": "error_message", "error": "Author or recipient not provided"}
				)
				return

			if str(author_id) == str(recipient_id):
				await self.channel_layer.group_send(
					f"user_{author_id}",
					{"type": "error_message", "error": "You can't send a friend request to yourself"}
				)
				return

			# Récupérer les utilisateurs
			initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
			recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

			# Normaliser l'ordre pour éviter les doublons
			if initiator.id > recipient_user.id:
				user, friend = recipient_user, initiator
			else:
				user, friend = initiator, recipient_user

			qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
			if await database_sync_to_async(qs.exists)():
				relation = await database_sync_to_async(qs.first)()
				if relation.status == "pending":
					initiator_id = await database_sync_to_async(lambda: relation.initiator.id)()
					if str(initiator_id) != str(author_id):
						relation.status = "accepted"
						await database_sync_to_async(relation.save)()
						confirmation_message = {
							"type": "info_message",
							"info": "Friend request accepted. You are now friends."
						}
						await self.channel_layer.group_send(f"user_{recipient_id}", confirmation_message)
						await self.channel_layer.group_send(f"user_{author_id}", confirmation_message)
					else:
						await self.channel_layer.group_send(
							f"user_{author_id}",
							{"type": "error_message", "error": "Friend request already sent"}
						)
					return

			# Créer une nouvelle demande d'ami en indiquant explicitement l'initiateur réel
			await database_sync_to_async(ManualFriendsRelations.objects.create)(
				user=user, friend=friend, status="pending", initiator=initiator
			)
			await self.channel_layer.group_send(f"user_{recipient_id}", event)
			await self.channel_layer.group_send(f"user_{author_id}", event)
			logger.info(f"Friend request sent from {author_id} to {recipient_id}")
