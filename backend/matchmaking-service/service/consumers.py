import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .matchmaking_manager import matchmaking_manager
from .private_manager import private_manager

logger = logging.getLogger(__name__)

class MatchmakingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("matchmaking_service", self.channel_name)
        logger.info(f"🔗 Connecté au groupe 'matchmaking_service' (channel={self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("matchmaking_service", self.channel_name)
        logger.info("🔴 Déconnecté du groupe 'matchmaking_service'")

    async def matchmaking_event(self, event):

        logger.info(f"[MatchmakingConsumer] Reçu un matchmaking_event: {event}")
        
        action = event.get("action")
        user_id = event.get("user_id")
        room_code = event.get("room_code")
        
        if room_code:
            if action == "join":
                result = private_manager.join_room(room_code, user_id)
                if result:
                    p1, p2 = result["players"][0], result["players"][1]
                    match_info_p1 = private_manager.match_found[p1]
                    match_info_p2 = private_manager.match_found[p2]

                    # Notifier p1
                    await self.channel_layer.group_send(f"user_{p1}", {
                        "type": "private_match_found", 
                        "game_id": match_info_p1["game_id"],
                        "side": match_info_p1["side"],
                        "roomCode": room_code,
                        "user_id": p1
                    })
                    logger.info(f"📡 Private match (room={room_code}) ! Notif envoyée à user_{p1}")

                    await self.channel_layer.group_send(f"user_{p2}", {
                        "type": "private_match_found",
                        "game_id": match_info_p2["game_id"],
                        "side": match_info_p2["side"],
                        "roomCode": room_code,
                        "user_id": p2
                    })

                    logger.info(f"📡 Private match (room={room_code}) ! Notif envoyée à user_{p2}")
                else:
                    logger.info(f"🔎 user_id={user_id} attend dans la private room {room_code}")

            elif action == "leave":
                private_manager.remove_from_room(room_code, user_id)
                logger.info(f"🔴 user_id={user_id} a quitté la private room {room_code}")
        else:
            if action == "join":
                result = matchmaking_manager.join_queue(user_id)
                if result:
                    p1 = result["players"][0]
                    p2 = result["players"][1]
                    

                    match_info_p1 = matchmaking_manager.match_found[p1]
                    match_info_p2 = matchmaking_manager.match_found[p2]
                        
                    await self.channel_layer.group_send(f"user_{p1}", {
                        "type": "match_found",
                        "game_id": match_info_p1["game_id"],
                        "side": match_info_p1["side"],
                        "user_id": p1,
                        "opponent_id": match_info_p1["opponent_id"]
                    })
                    logger.info(f"📡 Match trouvé! Notif envoyée à user_{p1}")

                    await self.channel_layer.group_send(f"user_{p2}", {
                        "type": "match_found",
                        "game_id": match_info_p2["game_id"],
                        "side": match_info_p2["side"],
                        "user_id": p2,
                        "opponent_id": match_info_p2["opponent_id"]
                    })
                    logger.info(f"📡 Match trouvé! Notif envoyée à user_{p2}")
                else:
                    pass
        
            elif action == "leave":
                matchmaking_manager.remove_from_queue(user_id)
