import json
import logging
import urllib.parse
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
        pass


class GatewayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("gateway", self.channel_name)

        query_string = self.scope["query_string"].decode("utf-8")
        query_params = urllib.parse.parse_qs(query_string)
        serial_keys = query_params.get("serial_key", [])
        if serial_keys:
            serial_key = serial_keys[0]
            group_name = f"tournament_{serial_key}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            logger.info(f"Client ajouté au groupe {group_name}")
        logger.info("🔗 Client connecté au WebSocket Gateway")

    async def disconnect(self, close_code):
        if self.user_id:
            await update_user_status(self.user_id, False)
            await self.channel_layer.group_discard(
                f"user_{self.user_id}", self.channel_name
            )
            logger.info(f"Utilisateur {self.user_id} est maintenant hors ligne.")

        await self.channel_layer.group_discard("gateway", self.channel_name)
        logger.info(f"Client {self.user_id} déconnecté du Gateway")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            author = data.get("author")

            if message_type == "init":
                self.user_id = data.get("userId")
                self.username = data.get("username")
                await update_user_status(self.user_id, True)
                await self.channel_layer.group_add(
                    f"user_{self.user_id}", self.channel_name
                )
                logger.info(
                    f"Initialization complete: Client {self.username} (ID: {self.user_id}) connected."
                )
                return

            if message_type == "chat_message":
                await self.channel_layer.group_send("chat_service", data)
                logger.info(f"Message général relayé à 'chat_service' depuis {author}")

            if message_type == "heartbeat":
                await self.channel_layer.group_send("auth_service", data)
                logger.info(f"Message général relayé à 'auth_service' depuis {author}")

            elif message_type == "private_message":
                recipient = data.get("recipient")
                if not recipient:
                    await self.send(
                        json.dumps(
                            {"error": "Recipient is required for private messages"}
                        )
                    )
                    return

                event = {
                    "type": "private_message",
                    "message": data.get("message"),
                    "author": author,
                    "recipient": recipient,
                    "recipient_id": data.get("recipient_id"),
                    "channel": "private",
                    "timestamp": data.get("timestamp"),
                }
                await self.channel_layer.group_send("chat_service", event)
                logger.info(f"Message privé envoyé à user_{recipient} depuis {author}")

            elif message_type == "info_message":
                logger.info(f"ℹ️ Message d'information reçu: {data}")
                recipient = data.get("recipient")
                if not recipient:
                    await self.send(
                        json.dumps(
                            {"error": "Recipient is required for friend requests"}
                        )
                    )
                    return
                logger.info(f"data: {data}")
                event = {
                    "type": "info_message",
                    "action": data.get("action"),
                    "author": author,
                    "recipient": recipient,
                    "timestamp": data.get("timestamp"),
                }
                await self.channel_layer.group_send("chat_service", event)
                logger.info("New notification send")

            elif message_type == "tournament_message":
                logger.info(f"Message de tournoi reçu: {data}")
                await self.channel_layer.group_send("tournament_service", data)
                logger.info("Message général relayé à 'tournament_service")

            elif data.get("type") == "game_event":
                game_id = data.get("game_id", "unknown_game")
                player1_id = data.get("player1", "Player 1")
                player2_id = data.get("player2", "Player 2")

                if data.get("action") == "start_game":
                    await self.channel_layer.group_add(
                        f"game_{game_id}", self.channel_name
                    )
                    logger.info(f"👥 Client rejoint le groupe game_{game_id}")

                    logger.info(
                        f"🚀 Envoi à pong_service: game_id={game_id}, player1={player1_id}, player2={player2_id}"
                    )

                await self.channel_layer.group_send(
                    "pong_service",
                    {
                        "type": "game_event",
                        "game_id": game_id,
                        "action": data.get("action"),
                        "player1": player1_id,
                        "player2": player2_id,
                        "direction": data.get("direction"),
                        "player_id": data.get("player_id"),
                    },
                )

            elif data.get("type") in ["matchmaking", "private_event"]:
                action = data.get("action")
                user_id = data.get("user_id", self.user_id)
                logger.info(
                    f"🚀 matchmaking_event/private_event => service : {action} {user_id}"
                )
                room_code = data.get("room_code")

                await self.channel_layer.group_send(
                    "matchmaking_service",
                    {
                        "type": "matchmaking_event",
                        "action": action,
                        "user_id": user_id,
                        "room_code": room_code,
                    },
                )
                logger.info(
                    f"🚀 matchmaking_event/private_event => service : {action} {user_id}, room={room_code}"
                )

        except json.JSONDecodeError:
            await self.send(json.dumps({"error": "Format JSON invalide"}))

    async def chat_message(self, event):
        """Reçoit un message (provenant du chat-service) et le renvoie au client."""
        await self.send(json.dumps(event))
        logger.info(f"Message transmis au client WebSocket (General): {event}")

    async def private_message(self, event):
        """This method handles private_message events delivered to this consumer."""
        await self.send(json.dumps(event))
        logger.info(f"Message transmis au client WebSocket (Private): {event}")

    async def info_message(self, event):
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
        ):
            await self.channel_layer.group_send("chat_service", event)
            logger.info(f"Message transmis au chat_service (back_tournament): {event}")
        else:
            await self.send(json.dumps(event))
            logger.info(f"Message transmis au client WebSocket (info_message): {event}")

    async def tournament_message(self, event):
        await self.send(json.dumps(event))
        logger.info(
            f"Message transmis au client WebSocket (Tournament Request): {event}"
        )

    async def error_message(self, event):
        """This method handles error_message events delivered to this consumer."""
        await self.send(json.dumps(event))
        logger.info(f"Message d'erreur transmis au client WebSocket (Private): {event}")

    async def game_state(self, event):
        await self.send(json.dumps(event))
        logger.info(f"Game state transmis au client : {event}")

    async def game_over(self, event):
        """Gère la fin du jeu et envoie le message au client."""
        await self.send(json.dumps(event))
        logger.info(f"🚨 Game over transmis au client WebSocket : {event}")

    async def match_found(self, event):
        await self.send(json.dumps(event))
        logger.info(f"🎯 Match trouvé! Envoyé au client {event['user_id']}")

    async def private_match_found(self, event):
        await self.send(json.dumps(event))
        logger.info(
            f"🔔 Private match_found envoyé au client {event['user_id']} : game_id={event['game_id']}, side={event['side']}"
        )

    async def tournament_creation(self, event):
        await self.send(json.dumps(event))
        logger.info("tournament_creation")

    async def logout(self, event):
        await self.send(
            json.dumps(
                {
                    "type": "logout",
                    "message": "Votre session a expiré ou a été supprimée.",
                }
            )
        )
        logger.info(f"Déconnexion envoyée à l'utilisateur {self.user_id}")
        await self.close()
