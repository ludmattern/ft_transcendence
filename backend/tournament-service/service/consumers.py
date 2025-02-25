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
			await self.handle_create_tournament(data)
		elif str(action) in ["join_tournament_lobby", "join_tournament_lobbby"]:
			await self.handle_join_tournament(data)
		else:
			logger.warning("Unknown action: %s", action)
			await self.send(json.dumps({"error": "Unknown action"}))

	async def handle_create_tournament(self, data):
		logger.info("Creating tournament lobby")
		user_id = data.get("userId")
		tournament_size = data.get("tournamentSize")

		user = await self.get_user(user_id)
		if user is None:
			await self.send(json.dumps({"error": "User not found"}))
			return

		# For now, use the user_id as the serial key (consider using uuid in production)
		serial_key = str(user_id)
		tournament = await self.create_tournament(serial_key, user, tournament_size)
		await self.add_participant(tournament, user)
		await self.update_user_status(user, "lobby")
		logger.info("User %s created tournament lobby with serial key %s", user.username, serial_key)

		# Add current channel to the tournament-specific group.
		tournament_group = f"tournament_{tournament.serial_key}"
		await self.channel_layer.group_add(tournament_group, self.channel_name)
		logger.info("Channel %s added to group %s", self.channel_name, tournament_group)

		# Send an immediate response back to the tournament-service connection (if needed)
		response = {
			"type": "tournament_message",
			"action": "create_tournament_lobby",
			"tournamentLobbyId": tournament.serial_key,
			"organizer": user.username,
			"tournamentSize": tournament_size,
			"message": "Tournament lobby created successfully",
		}
		await self.send(json.dumps(response))
		logger.info("Response sent: %s", response)

		# Now broadcast to the tournament group using a distinct event type.
		await self.channel_layer.group_send(
			tournament_group,
			{
				"type": "tournament_message",  # This must match a handler on the gateway.
				"action": "create_tournament_lobby",
				"tournamentLobbyId": tournament.serial_key,
				"organizer": user.username,
				"tournamentSize": tournament_size,
				"message": "Tournament lobby created successfully",
			}
		)

	async def handle_join_tournament(self, data):
		# Similar handling for join – ensure that after joining you broadcast using a distinct type.
		logger.info("Handling join tournament lobby")
		user_id = data.get("userId")
		tournament_serial_key = data.get("tournamentSerialKey")
		tournament_size = data.get("tournamentSize")

		user = await self.get_user(user_id)
		if user is None:
			await self.send(json.dumps({"error": "User not found"}))
			return

		tournament = await self.get_tournament(tournament_serial_key)
		if tournament is None:
			await self.send(json.dumps({"error": "Tournament not found"}))
			return

		participant_count = await self.count_participants(tournament)
		if participant_count >= int(tournament_size):
			await self.send(json.dumps({"error": "Tournament lobby is full"}))
			return

		await self.add_participant(tournament, user)
		await self.update_user_status(user, "lobby")
		tournament_group = f"tournament_{tournament.serial_key}"
		await self.channel_layer.group_add(tournament_group, self.channel_name)
		logger.info("Channel %s added to group %s", self.channel_name, tournament_group)

		response = {
			"type": "tournament_message",
			"action": "join_tournament_lobby",
			"tournamentLobbyId": tournament.serial_key,
			"message": f"{user.username} joined the tournament lobby",
		}
		await self.send(json.dumps(response))
		logger.info("Response sent for join: %s", response)

		# Optionally broadcast a join event using a distinct type.
		await self.channel_layer.group_send(
			tournament_group,
			{
				"type": "tournament_message",  # Another distinct type.
				"action": "join_tournament_lobby",
				"tournamentLobbyId": tournament.serial_key,
				"message": f"{user.username} joined the tournament lobby",
			}
		)

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

	@database_sync_to_async
	def get_tournament(self, serial_key):
		try:
			return ManualTournament.objects.get(serial_key=serial_key)
		except ManualTournament.DoesNotExist:
			return None

	@database_sync_to_async
	def count_participants(self, tournament):
		return tournament.participants.count()
