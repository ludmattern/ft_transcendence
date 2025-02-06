import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .matchmaking_manager import matchmaking_manager

logger = logging.getLogger(__name__)

class MatchmakingConsumer(AsyncWebsocketConsumer):
    """
    Consumer "dummy" pour relier le `gateway-service` 
    au `matchmaking-service` via un WS interne.
    """
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("matchmaking_service", self.channel_name)
        logger.info(f"🔗 Connecté au groupe 'matchmaking_service' (channel={self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("matchmaking_service", self.channel_name)
        logger.info("🔴 Déconnecté du groupe 'matchmaking_service'")

    async def matchmaking_event(self, event):
        """
        Handler pour tous les messages:
        { "type": "matchmaking_event", "action": "join"|"leave", "user_id": "..." }
        """
        logger.info(f"[MatchmakingConsumer] Reçu un matchmaking_event: {event}")
        
        action = event.get("action")
        user_id = event.get("user_id")
        
        if action == "join":
            result = matchmaking_manager.join_queue(user_id)
            if result:
                await self.channel_layer.group_send("gateway", {
                    "type": "match_found",
                    "user_id": user_id,
                    "game_id": result["game_id"],
                    "side": result["side"]
                })

            else:
                pass
        
        elif action == "leave":
            matchmaking_manager.remove_from_queue(user_id)
