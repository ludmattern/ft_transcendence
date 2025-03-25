import json
import logging
import urllib.parse
import httpx  # type: ignore
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore


logger = logging.getLogger(__name__)

from service.models import ManualUser  # noqa: E402
from asgiref.sync import sync_to_async  # type: ignore # noqa: E402


@sync_to_async
def update_user_status(user_id, is_connected):
    try:
        user = ManualUser.objects.get(id=user_id)
        user.is_connected = is_connected
        user.save()
    except ManualUser.DoesNotExist:
        logger.error("Impossible to update user")


class GatewayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            await self.accept()
            query_string = self.scope["query_string"].decode("utf-8")
            query_params = urllib.parse.parse_qs(query_string)

            self.game_id = None

            if query_params.get("dummy", [None])[0] == "true":
                self.user_id = 0
            else:
                cookies = self.scope.get("cookies", {})
                try:
                    self.user_id = await fetch_user_id(cookies)
                except Exception as e:
                    logger.exception("Failed to fetch user ID: %s", e)
                    return await self.close()
                    
                if not self.user_id:
                    return await self.close()

            await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
            await update_user_status(self.user_id, True)
            await self.channel_layer.group_add("gateway", self.channel_name)

            query_string = self.scope["query_string"].decode("utf-8")
            query_params = urllib.parse.parse_qs(query_string)
            serial_keys = query_params.get("serial_key", [])
            if serial_keys:
                serial_key = serial_keys[0]
                group_name = f"tournament_{serial_key}"
                await self.channel_layer.group_add(group_name, self.channel_name)
            return None
            
        except Exception as e:
            logger.exception("Error during WebSocket connect: %s", e)
            await self.close()

    async def disconnect(self, close_code):
        try:
            if self.user_id:
                await update_user_status(self.user_id, False)
                await self.channel_layer.group_send(
                    "pong_service", {"type": "game_event", "action": "game_giveup", "user_id": self.user_id, "game_id": self.game_id}
                )
                await self.channel_layer.group_discard(f"user_{self.user_id}", self.channel_name)

            await self.channel_layer.group_discard("gateway", self.channel_name)
        except Exception as e:
            logger.exception("Error during WebSocket disconnect: %s", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            author = self.user_id

            if message_type == "chat_message":
                data["author"] = author
                await self.channel_layer.group_send("chat_service", data)

            elif message_type == "private_message":
                recipient = data.get("recipient")
                if not recipient:
                    await self.send(json.dumps({"error": "Recipient is required for private messages"}))
                    return

                event = {
                    "type": "private_message",
                    "message": data.get("message"),
                    "author": self.user_id,
                    "recipient": recipient,
                    "recipient_id": data.get("recipient_id"),
                    "channel": "private",
                    "timestamp": data.get("timestamp"),
                }
                await self.channel_layer.group_send("chat_service", event)

            elif message_type == "info_message":
                recipient = data.get("recipient")
                if not recipient:
                    await self.send(json.dumps({"error": "Recipient is required for friend requests"}))
                    return
                event = {
                    "type": "info_message",
                    "action": data.get("action"),
                    "author": self.user_id,
                    "initiator": self.user_id,
                    "recipient": recipient,
                    "timestamp": data.get("timestamp"),
                }
                await self.channel_layer.group_send("chat_service", event)
                logger.info("New notification send")

            elif message_type == "tournament_message":
                if data.get("action") == "leave_online_tournament":
                    data["user_id"] = self.user_id
                elif data.get("action") == "join_tournament" or data.get("action") == "reject_tournament":
                    data["userId"] = self.user_id
                elif data.get("action") == "create_online_tournament":
                    data["organizer_id"] = self.user_id
                await self.channel_layer.group_send("tournament_service", data)

            elif data.get("type") == "game_event":
                player1_id = data.get("player1", "Player 1")
                player2_id = data.get("player2", "Player 2")

                if data.get("action") == "start_game":
                    game_id = data.get("game_id", "unknown_game")
                    self.game_id = game_id
                    await self.channel_layer.group_add(f"game_{self.game_id}", self.channel_name)
                if data.get("action") == "give_up":
                    await self.channel_layer.group_discard(f"game_{self.game_id}", self.channel_name)

                await self.channel_layer.group_send(
                    "pong_service",
                    {
                        "type": "game_event",
                        "game_id": self.game_id,
                        "action": data.get("action"),
                        "player1": player1_id,
                        "player2": player2_id,
                        "direction": data.get("direction"),
                        "player_id": data.get("player_id"),
                        "user_id": self.user_id,
                        "local_player": data.get("local_player"),
                        "local_leave" : data.get("local_leave"),
                        "difficulty": data.get("difficulty"),
                    },
                )

            elif data.get("type") in ["matchmaking", "private_event"]:
                action = data.get("action")
                room_code = data.get("room_code")

                await self.channel_layer.group_send(
                    "matchmaking_service",
                    {"type": "matchmaking_event", "action": action, "user_id": str(self.user_id), "room_code": str(room_code)},
                )

        except json.JSONDecodeError:
            await self.send(json.dumps({"error": "Format JSON invalide"}))

    async def chat_message(self, event):
        try:
            """Reçoit un message (provenant du chat-service) et le renvoie au client."""
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send chat message: %s", e)

    async def private_message(self, event):
        try:
            """This method handles private_message events delivered to this consumer."""
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send private message: %s", e)


    async def info_message(self, event):
        try:
            """This method handles friend request sending events delivered to this consumer."""
            action = event.get("action")
            if (
                action == "back_tournament_invite"
                or action == "back_join_tournament"
                or action == "back_reject_tournament"
                or action == "back_cancel_tournament_invite"
                or action == "back_kick_tournament"
                or action == "back_cancel_tournament"
                or action == "back_leave_tournament"
                or action == "back_tournament_game_over"
                or action == "back_create_online_tournament"
            ):
                await self.channel_layer.group_send("chat_service", event)
            else:
                await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send info message: %s", e)

    async def tournament_message(self, event):
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send tournament message: %s", e)

    async def error_message(self, event):
        try: 
            """This method handles error_message events delivered to this consumer."""
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send error message: %s", e)

    async def game_state(self, event):
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send game state: %s", e)

    async def game_over(self, event):
        try:
            """Gère la fin du jeu et envoie le message au client."""
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send game over: %s", e)

    async def leave_game(self, event):
        logger.info("Leave_game")

    async def match_found(self, event):
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send match found: %s", e)

    async def private_match_found(self, event):
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send private match found: %s", e)

    async def tournament_creation(self, event):
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            logger.exception("Failed to send tournament creation: %s", e)

    async def logout(self, event):
        try:
            await self.send(
                json.dumps(
                    {
                        "type": "logout",
                        "message": "Votre session a expiré ou a été supprimée.",
                    }
                )
            )
            await self.close()
        except Exception as e:
            logger.exception("Failed to send logout: %s", e)

ca_cert_path = "/data/certs/selfsigned.crt"

async def fetch_user_id(cookies):
    try:
        async with httpx.AsyncClient(
            base_url="https://auth-service:3001",
            verify=ca_cert_path
        ) as client:
            response = await client.get("/get_user_id_from_cookie/", cookies=cookies)

            if response.status_code == 200:
                try:
                    data = response.json()
                    return data.get("user_id")
                except ValueError:
                    logger.error("Invalid JSON in response when fetching user ID")
                    return None
            else:
                logger.error(f"Error when get user id: {response.text}")
                return None

    except httpx.RequestError as e:
        logger.exception(f"Request error while fetching user ID: {e}")
        return None

    except Exception as e:
        logger.exception(f"Unexpected error while fetching user ID: {e}")
        return None