import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer


logger = logging.getLogger(__name__)

class TournamentConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("tournament_service", self.channel_name)
        logger.info(f"🔗 Connecté au groupe 'tournament_service' (channel={self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("tournament_service", self.channel_name)
        logger.info("🔴 Déconnecté du groupe 'tournament_service'")

    async def tournament_event(self, event):

        logger.info(f"[TournamentConsumer] Reçu un tournament_service: {event}")
        
        
