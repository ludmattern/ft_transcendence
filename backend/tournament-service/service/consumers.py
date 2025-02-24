import json
import random
import string
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ManualTournament, ManualUser, ManualTournamentParticipants, TournamentMatch
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
		self.room_group_name = "tournament"
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.accept()
		logger.info(f"🔗 Connecté au groupe 'local_tournament' (channel={self.channel_name})")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
		logger.info(f"🔌 Déconnecté du groupe 'local_tournament' (channel={self.channel_name})")

	async def tournament_message(self, event):
		action = event.get("action")
		if action == "create_tournament_lobby":
			serial_key = event.get("serial_key")
			if serial_key:
				group_name = f"tournament_{serial_key}"
				await self.channel_layer.group_add(group_name, self.channel_name)


	async def tournament_created(self, event):
		#TODO notif 
		#ici app systeme de notif pour prevenir les joueurs que le tournois a commencer 
		logger.info(f" Notif a tout les client ")
