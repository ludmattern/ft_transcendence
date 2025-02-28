import json
import random
import string
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ManualTournament, ManualUser, ManualTournamentParticipants, TournamentMatch
import logging
from channels.db import database_sync_to_async 
from cryptography.fernet import Fernet
from django.conf import settings
import math
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_username(user_id):
	try:
		user = ManualUser.objects.get(pk=user_id)
		return user.username
	except ManualUser.DoesNotExist:
		return None

cipher = Fernet(settings.FERNET_KEY)

def encrypt_thing(args):
	"""Encrypts the args."""
	return cipher.encrypt(args.encode('utf-8')).decode('utf-8')

class TournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_group_name = "tournament_service"
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.accept()
		logger.info("Connected to tournament_service group (channel=%s)", self.channel_name)

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		logger.info("Disconnected from tournament_service group (channel=%s)", self.channel_name)

	async def tournament_message(self, event):
		logger.info("Tournament message received: %s", event)
		action = event.get("action")
		logger.info("Action received: %s", action)
		if str(action) == "create_tournament_lobby":
			user_id = event.get("userId")
			tournament_size = event.get("tournamentSize")
			user = await self.get_user(user_id)
			serial_key = str(user_id)
			tournament = await self.create_tournament(serial_key, user, tournament_size)
			await self.add_participant(tournament, user)
			await self.update_user_status(user, "lobby")
			await self.channel_layer.group_send(f"user_{user_id}", {
				"type": "tournament_message",
				"action": "create_tournament_lobby",
				"tournamentLobbyId": tournament.serial_key,
				"organizer": user.username,
				"tournamentSize": tournament_size,
				"message": f"Tournament lobby created successfully by {user.username}",
			})   
			logger.info("Tournament lobby created successfully")
		elif str(action) == "join_tournament":
			invitedId = event.get("userId")
			invitedUser = await self.get_user(invitedId)
			invitedTournament = event.get("tournamentId")

			@database_sync_to_async
			def find_invitedUser_in_tournament(invitedUser, invitedTournament):
				return ManualTournamentParticipants.objects.filter(user=invitedUser, tournament=invitedTournament, status="pending").first()

			invitedUserInTournament = await find_invitedUser_in_tournament(invitedUser, invitedTournament)
			if not invitedUserInTournament:
				logger.warning(f"User {invitedUser.username} not found in tournament {invitedTournament}")
				return
			
			@database_sync_to_async
			def accept_invited_user(invitedUserInTournament):
				invitedUserInTournament.status = "accepted"
				invitedUserInTournament.save()

			await accept_invited_user(invitedUserInTournament)

			await self.channel_layer.group_send(f"user_{invitedId}", {
				"type": "info_message",
				"action": "back_join_tournament",
				"tournament_id": invitedTournament,
				"recipient": invitedId,
			})

		elif str(action) == "reject_tournament":
			invitedId = event.get("userId")
			invitedUser = await self.get_user(invitedId)
			invitedTournament = event.get("tournamentId")

			@database_sync_to_async
			def find_invitedUser_in_tournament(invitedUser, invitedTournament):
				return ManualTournamentParticipants.objects.filter(user=invitedUser, tournament=invitedTournament, status="pending").first()

			invitedUserInTournament = await find_invitedUser_in_tournament(invitedUser, invitedTournament)
			if not invitedUserInTournament:
				logger.warning(f"User {invitedUser.username} not found in tournament {invitedTournament}")
				return
			
			@database_sync_to_async
			def cancel_invited_user(invitedUserInTournament):
				invitedUserInTournament.status = "rejected"
				invitedUserInTournament.save()

			await cancel_invited_user(invitedUserInTournament)

			await self.channel_layer.group_send(f"user_{invitedId}", {
				"type": "info_message",
				"action": "back_reject_tournament",
				"tournament_id": invitedTournament,
				"recipient": invitedId,
			})

		elif str(action) == "tournament_invite":
			author_id = event.get("author")
			recipient_id = event.get("recipient")
			initiator = await self.get_user(author_id)
			recipient_user = await self.get_user(recipient_id)

			author_username = await get_username(author_id)
			event["author_username"] = author_username
			recipient_username = await get_username(recipient_id)
			event["recipient_username"] = recipient_username

			logger.info("Author: %s, Recipient: %s", author_username, recipient_username)

			@database_sync_to_async
			def get_initiator_tournament(initiator):
				return ManualTournament.objects.filter(organizer=initiator, status="upcoming").first()

			tournament = await get_initiator_tournament(initiator)

			logger.info("Tournament: %s", tournament)

			if not tournament:
				logger.warning(f"No active tournament found for initiator {initiator.username}")
				return

			logger.info("Tournament found: %s", tournament)
			await self.invite_participant(tournament, recipient_user)
			await self.channel_layer.group_send(f"user_{author_id}", {
				"type": "info_message",
				"action": "back_tournament_invite",
				"author": author_id,
				"recipient": recipient_id,
			})	

			logger.info("Tournament invite sent to %s", recipient_username)

		else:
			logger.warning("Unknown action: %s", action)
			await self.send(json.dumps({"error": "Unknown action"}))

	# ---------------------------------
	# Database helper functions (wrapped with database_sync_to_async)
	# ---------------------------------
	@database_sync_to_async
	def get_user(self, user_id):
		try:
			return ManualUser.objects.get(id=user_id)
		except ManualUser.DoesNotExist:
			return None

	@database_sync_to_async
	def create_tournament(self, serial_key, user, tournament_size):
		return ManualTournament.objects.create(
			serial_key=serial_key,
			organizer=user,
			rounds=tournament_size
		)

	@database_sync_to_async
	def add_participant(self, tournament, user):
		return ManualTournamentParticipants.objects.get_or_create(
			tournament=tournament,
			user=user,
			status="accepted"
		)
	
	@database_sync_to_async
	def invite_participant(self, tournament, user):
		return ManualTournamentParticipants.objects.get_or_create(
			tournament=tournament,
			user=user,
			status="pending"
		)

	@database_sync_to_async
	def update_user_status(self, user, status):
		user.tournament_status = status
		user.save()
  