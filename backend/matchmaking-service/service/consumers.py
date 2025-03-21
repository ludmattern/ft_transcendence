import logging
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from .matchmaking_manager import matchmaking_manager
from .private_manager import private_manager

logger = logging.getLogger(__name__)


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            await self.accept()
            await self.channel_layer.group_add("matchmaking_service", self.channel_name)
            logger.info(
                f" Connected on 'matchmaking_service' (channel={self.channel_name})"
            )
        except Exception as e:
            logger.exception("Error on connection: %s", e)

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard("matchmaking_service", self.channel_name)
            logger.info("Disconnected of 'matchmaking_service'")
        except Exception as e:
            logger.exception("Error on disconnection: %s", e)

    async def matchmaking_event(self, event):
        try:
            action = event.get("action")
            user_id = event.get("user_id")
            room_code = str(event.get("room_code"))

            if room_code and room_code != "None":
                if action == "join":
                    result = private_manager.join_room(room_code, user_id)
                    if result:
                        p1, p2 = result["players"][0], result["players"][1]
                        match_info_p1 = private_manager.match_found.get(p1)
                        if match_info_p1 is None:
                            logger.error(f"No match info found for p1: {p1}")
                            return
                        match_info_p2 = private_manager.match_found.get(p2)
                        if match_info_p2 is None:
                            logger.error(f"No match info found for p2: {p2}")
                            return

                        await self.channel_layer.group_send(
                            f"user_{p1}",
                            {
                                "type": "private_match_found",
                                "game_id": match_info_p1["game_id"],
                                "side": match_info_p1["side"],
                                "roomCode": room_code,
                                "user_id": p1,
                                "opponent_id": match_info_p1["opponent_id"],
                            },
                        )
                        logger.info(
                            f" Private match (room={room_code}) ! notif send to user_{p1}"
                        )

                        await self.channel_layer.group_send(
                            f"user_{p2}",
                            {
                                "type": "private_match_found",
                                "game_id": match_info_p2["game_id"],
                                "side": match_info_p2["side"],
                                "roomCode": room_code,
                                "user_id": p2,
                                "opponent_id": match_info_p2["opponent_id"],
                            },
                        )
                        logger.info(
                            f" Private match (room={room_code}) ! notif send to user_{p2}"
                        )
                    else:
                        logger.info(
                            f"🔎 user_id={user_id} waiting in private room {room_code}"
                        )

                elif action == "leave":
                    private_manager.remove_from_room(room_code, user_id)
                    logger.info(
                        f"user_id={user_id} leave private room {room_code}"
                    )

            elif not room_code or room_code == "None":
                if action == "join":
                    result = matchmaking_manager.join_queue(user_id)
                    if result:
                        p1 = result["players"][0]
                        p2 = result["players"][1]

                        match_info_p1 = matchmaking_manager.match_found.get(p1)
                        if match_info_p1 is None:
                            logger.error(f"No match info found for p1: {p1}")
                            return
                        match_info_p2 = matchmaking_manager.match_found.get(p2)
                        if match_info_p2 is None:
                            logger.error(f"No match info found for p2: {p2}")
                            return

                        await self.channel_layer.group_send(
                            f"user_{p1}",
                            {
                                "type": "match_found",
                                "game_id": match_info_p1["game_id"],
                                "side": match_info_p1["side"],
                                "user_id": p1,
                                "opponent_id": match_info_p1["opponent_id"],
                            },
                        )
                        await self.channel_layer.group_send(
                            f"user_{p2}",
                            {
                                "type": "match_found",
                                "game_id": match_info_p2["game_id"],
                                "side": match_info_p2["side"],
                                "user_id": p2,
                                "opponent_id": match_info_p2["opponent_id"],
                            },
                        )
                    else:
                        logger.info(f"No match found for user_id={user_id}")
                elif action == "leave":
                    matchmaking_manager.remove_from_queue(user_id)
        except Exception as e:
            logger.exception("Exception in matchmaking_event: %s", e)
