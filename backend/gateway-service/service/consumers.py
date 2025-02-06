import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class GatewayConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		self.user_id = self.scope["user"].id if self.scope.get("user") and self.scope["user"].is_authenticated else "guest"
		await self.channel_layer.group_add("gateway", self.channel_name)
		logger.info(f"🔗 Client {self.user_id} connecté au WebSocket Gateway")

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("gateway", self.channel_name)
		logger.info(f"Client {self.user_id} déconnecté du Gateway")

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			if data.get("type") == "chat_message":
				event = {
					"type": "chat_message",
					"message": data.get("message"),
					"author": data.get("author"),
					"channel": data.get("channel"),
					"timestamp": data.get("timestamp")
				}
				logger.info(f"Data reçue : {data}")


				await self.channel_layer.group_send("chat_service", event)
				logger.info(f"Message relayé à 'chat_service' depuis {self.user_id}")
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
			elif data.get("type") == "matchmaking":
				action = data.get("action") 
				user_id = data.get("user_id", self.user_id)

				await self.channel_layer.group_send("matchmaking_service", {
					"type": "matchmaking_event",
					"action": action,
					"user_id": user_id
				})
				logger.info(f"🚀 matchmaking_event envoyé à matchmaking_service : {action} {user_id}")
			
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


	async def match_found(self, event):
			"""
			envoyé par matchmaking-service. 
			"""
			await self.send(json.dumps(event))
   
			logger.info(f"  tch_found envoyé au client: {event}")