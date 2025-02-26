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

	async def tournament_message(self, data):
		logger.info("Tournament message received: %s", data)
		action = data.get("action")
		logger.info("Action received: %s", action)
		if str(action) == "create_tournament_lobby":
			user_id = data.get("userId")
			tournament_size = data.get("tournamentSize")
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
		elif str(action) == "join_tournament_lobby":
			user_id = data.get("userId")
			serial_key = data.get("tournamentLobbyId")
			user = await self.get_user(user_id)
			tournament = await self.get_tournament(serial_key)
			await self.add_participant(tournament, user)
			await self.update_user_status(user, "lobby")
			for participant in tournament.participants.all():
				await self.channel_layer.group_send(f"user_{participant.user.id}", {
					"type": "tournament_message",
					"message": f"{user.username} joined the tournament lobby",
				})
			logger.info(f"{user.username} joined the tournament lobby")
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
			user=user
		)

	@database_sync_to_async
	def update_user_status(self, user, status):
		user.tournament_status = status
		user.save()
