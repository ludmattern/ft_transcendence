import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class GatewayConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		self.user_id = self.scope["user"].id if self.scope.get("user") and self.scope["user"].is_authenticated else "guest"
		await self.channel_layer.group_add("gateway", self.channel_name)
		await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
		logger.info(f"🔗 Client {self.user_id} connecté au WebSocket Gateway")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("gateway", self.channel_name)
		await self.channel_layer.group_discard(f"user_{self.user_id}", self.channel_name)
		logger.info(f"Client {self.user_id} déconnecté du Gateway")

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			message_type = data.get("type")

			# Always use the authenticated username as the author.
			author = self.username

			if message_type == "chat_message":
				# For general messages, simply forward to the chat_service.
				event = {
					"type": "chat_message",
					"message": data.get("message"),
					"author": author,
					"channel": "general",
					"timestamp": data.get("timestamp"),
				}
				await self.channel_layer.group_send("chat_service", event)
				logger.info(f"Message général relayé à 'chat_service' depuis {author}")

			elif message_type == "private_message":
				# For private messages, the payload must include a recipient (username).
				recipient = data.get("recipient")
				if not recipient:
					await self.send(json.dumps({"error": "Recipient is required for private messages"}))
					return

				event = {
					"type": "private_message",
					"message": data.get("message"),
					"author": author,
					"recipient": recipient,
					"channel": "private",
					"timestamp": data.get("timestamp"),
				}
				# Send the event to the recipient's personal group.
				await self.channel_layer.group_send(f"user_{recipient}", event)
				logger.info(f"Message privé envoyé à user_{recipient} depuis {author}")
    
			elif data.get("type") == "game_event":
       
				if data.get("action") == "start_game":
					game_id = data.get("game_id")
					await self.channel_layer.group_add(f"game_{game_id}", self.channel_name)
					logger.info(f"👥 Client rejoint le groupe game_{game_id}")
				await self.channel_layer.group_send("pong_service", 
                {
					"type": "game_event",
					"game_id": data.get("game_id"),
					"action": data.get("action"),
					"direction": data.get("direction"),
					"player_id": data.get("player_id"),
				})
				logger.info("🚀 Événement de jeu relayé à 'pong_service'")
			
		except json.JSONDecodeError:
			await self.send(json.dumps({"error": "Format JSON invalide"}))

	async def chat_message(self, event):
		"""Reçoit un message (provenant du chat-service) et le renvoie au client."""
		await self.send(json.dumps(event))
		logger.info(f"Message transmis au client WebSocket : {event}")

	
	async def game_state(self, event):
		await self.send(json.dumps(event))
		logger.info(f"Game state transmis au client : {event}")

	async def game_over(self, event):
		"""Gère la fin du jeu et envoie le message au client."""
		await self.send(json.dumps(event))
		logger.info(f"🚨 Game over transmis au client WebSocket : {event}")
