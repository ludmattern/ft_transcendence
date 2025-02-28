import json
import logging
from .models import ManualUser
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db.models import Q
from .models import ManualUser, ManualFriendsRelations, ManualTournamentParticipants, ManualTournament
from asgiref.sync import sync_to_async

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

async def get_profile_picture(user_id):
    try:
        user = await sync_to_async(ManualUser.objects.get)(id=user_id)
        return user.profile_picture.url
    except ManualUser.DoesNotExist:
        return "/media/profile_pics/default-profile-150.png"

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
		profile_picture = await get_profile_picture(author_id)
		event["username"] = username
		event["profilePicture"] = profile_picture
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
		profile_picture = await get_profile_picture(author_id)
		event["profilePicture"] = profile_picture

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
			message = {"type": "error_message", "error": "You can't send a message to yourself."}
			await self.channel_layer.group_send(f"user_{author_id}", message)
			return

		event["username"] = username

		await self.channel_layer.group_send(f"user_{recipient_id}", event)
		await self.channel_layer.group_send(f"user_{author_id}", event)
		logger.info(f"Message transmitted to groups user_{recipient_id} and user_{author_id}: {event}")


	async def info_message(self, event):
		"""Send a friend request or accept an existing one if initiated by the other user."""
		logger.info(f"ChatConsumer info message received event: {event}")

		action = event.get("action")
		author_id = event.get("author")
		recipient_id = event.get("recipient")
		author_username = await get_username(author_id)
		event["author_username"] = author_username
		recipient_username = await get_username(recipient_id)
		event["recipient_username"] = recipient_username


		if str(action) == "send_friend_request":
			if not author_id or not recipient_id:
				await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "Author or recipient not provided"})
				return

			if str(author_id) == str(recipient_id):
				await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "You can't send a friend request to yourself"})
				return

			initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
			recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

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
						await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"You are now friend with {author_username}"})
						await self.channel_layer.group_send(f"user_{author_id}", {"type": "info_message", "info": f"You are now friend with {recipient_username}"})
						await self.channel_layer.group_send(f"user_{recipient_id}", event)
						await self.channel_layer.group_send(f"user_{author_id}", event)
						logger.info(f"Friend request accepted between {author_id} and {recipient_id} : {event}")
					else:
						await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "Friend request already sent"})
					return

			await database_sync_to_async(ManualFriendsRelations.objects.create)(
				user=user, friend=friend, status="pending", initiator=initiator
			)
			await self.channel_layer.group_send(f"user_{author_id}", {"type": "info_message", "info": f"Friend request sent to {recipient_username}"})
			await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"Friend request received from {author_username}"})
			await self.channel_layer.group_send(f"user_{recipient_id}", event)
			await self.channel_layer.group_send(f"user_{author_id}", event)
			logger.info(f"Friend request sent from {author_id} to {recipient_id} : {event}")

		elif str(action) in ["reject_friend_request", "remove_friend"]:
			initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
			recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
			author_username = await get_username(author_id)
			event["author_username"] = author_username
			recipient_username = await get_username(recipient_id)
			event["recipient_username"] = recipient_username

			if initiator.id > recipient_user.id:
				user, friend = recipient_user, initiator
			else:
				user, friend = initiator, recipient_user

			qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
			if await database_sync_to_async(qs.exists)():
				relation = await database_sync_to_async(qs.first)()
				if relation.status == "pending":
					await database_sync_to_async(relation.delete)()
					await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"{author_username} rejected your friend request."})
					await self.channel_layer.group_send(f"user_{author_id}", {"type": "info_message", "info": f"Friend request from {recipient_username} rejected."})
					await self.channel_layer.group_send(f"user_{recipient_id}", event)
					await self.channel_layer.group_send(f"user_{author_id}", event)
				elif relation.status == "accepted":
					await database_sync_to_async(relation.delete)()
					await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"{author_username} removed you from friends."})
					await self.channel_layer.group_send(f"user_{author_id}", {"type": "info_message", "info": f"You removed {recipient_username} from friends."})
					await self.channel_layer.group_send(f"user_{recipient_id}", event)
					await self.channel_layer.group_send(f"user_{author_id}", event)
				else:
					logger.info(f"Invalid action: {action}")

			else:
				await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "No friend relationship found."})
			return
		elif str(action) == "tournament_invite":
			initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
			recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
			author_username = await get_username(author_id)
			event["author_username"] = author_username
			recipient_username = await get_username(recipient_id)
			event["recipient_username"] = recipient_username

			@database_sync_to_async
			def get_initiator_tournament(initiator):
				return ManualTournament.objects.filter(organizer=initiator, status="upcoming").first()

			initiator_tournament = await get_initiator_tournament(initiator)

			if not initiator_tournament:
				logger.warning(f"No active tournament found for initiator {initiator.username}")
				await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "No active tournament upcoming found."})
				return

			@database_sync_to_async
			def get_participants(tournament):
				return list(tournament.participants.select_related('user').all())

			participants = await get_participants(initiator_tournament)

			for participant in participants:
				await self.channel_layer.group_send(f"user_{participant.user.id}", {"type": "info_message", "info": f"{author_username} invited {recipient_username} to the tournament.", "message": "Successfully invited."})

			await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"You have been invited to a tournament by {author_username}"})

		else:
			await self.channel_layer.group_send(f"user_{author_id}", {"type": "error_message", "error": "Invalid action."})
   
		
