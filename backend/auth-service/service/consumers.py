import asyncio
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

logger = logging.getLogger(__name__)

class AuthConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		# Ajoute le client au groupe général de l'auth_service
		await self.channel_layer.group_add("auth_service", self.channel_name)
		logger.info(f"🔗 Connecté au groupe auth_service (channel: {self.channel_name})")

	async def disconnect(self, close_code):
		if hasattr(self, "heartbeat_task"):
			self.heartbeat_task.cancel()
		await self.channel_layer.group_discard("auth_service", self.channel_name)
		logger.info("Déconnecté du groupe auth_service")

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get("type")
		
		if message_type == "init":
			# Extraction de l'ID utilisateur transmis par le gateway
			self.user_id = data.get("userId")
			# Ajoute le client au groupe personnel pour pouvoir rediriger des messages ultérieurement
			await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
			logger.info(f"Initialisation : utilisateur {self.user_id} ajouté au groupe user_{self.user_id}")
			self.last_heartbeat = timezone.now()
			self.heartbeat_task = asyncio.create_task(self.heartbeat_loop())
			return
		
		if message_type == "heartbeat":
			# Mise à jour du timestamp lors de la réception d'un heartbeat
			self.user_id = data.get("userId")
			self.last_heartbeat = timezone.now()
			logger.info(f"Heartbeat reçu pour l'utilisateur {self.user_id}")
			await self.send(json.dumps({"type": "heartbeat_ack"}))
			return

		# Traitement d'autres messages (si nécessaire)
		logger.info(f"Message reçu dans AuthConsumer : {data}")

	async def heartbeat_loop(self):
		"""
		Vérifie toutes les 5 secondes si le dernier heartbeat date de plus de 15 secondes.
		En cas d'inactivité, redirige un message 'logout' vers le groupe de l'utilisateur et ferme la connexion.
		"""
		timeout = 15  # Délai d'inactivité en secondes
		try:
			while True:
				elapsed = (timezone.now() - self.last_heartbeat).total_seconds()
				if elapsed > timeout:
					logger.warning(f"Aucun heartbeat reçu depuis {elapsed} secondes pour l'utilisateur {self.user_id}.")
					# Redirection du message de déconnexion vers le groupe personnel de l'utilisateur
					await self.channel_layer.group_send(
						f"user_{self.user_id}",
						{
							"type": "logout_message",
							"message": "Votre session a expiré en raison de l'inactivité."
						}
					)
					break
				await asyncio.sleep(5)  # Vérifie toutes les 5 secondes
		except asyncio.CancelledError:
			pass

	async def logout_message(self, event):
		"""
		Méthode appelée lors de la réception d'un message de déconnexion.
		Le message est envoyé au client pour qu'il se déconnecte.
		"""
		await self.send(json.dumps({
			"type": "logout",
			"message": event.get("message", "Session expirée.")
		}))
		logger.info(f"Message de logout transmis à l'utilisateur {self.user_id}")
		await self.close()
