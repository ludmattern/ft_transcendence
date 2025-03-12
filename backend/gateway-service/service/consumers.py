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
        pass


class GatewayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        query_string = self.scope["query_string"].decode("utf-8")
        query_params = urllib.parse.parse_qs(query_string)
        self.game_id = None
        if query_params.get("dummy", [None])[0] == "true":
            self.user_id = 0
            logger.info("Connexion dummy détectée, bypass cookie auth.")
        else:
            cookies = self.scope.get("cookies", {})
            self.user_id = await fetch_user_id(cookies)
            if not self.user_id:
                logger.error("Impossible de récupérer l'ID utilisateur depuis l'auth-service")
                return await self.close()

        await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
        logger.info(f"User {self.user_id} connecté via WebSocket Gateway")
        await update_user_status(self.user_id, True)
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
            await self.channel
            await self.channel_layer.group_send("pong_service", {"type": "game_event", "action": "game_giveup", "user_id": self.user_id, "game_id": self.game_id})
            await self.channel_layer.group_discard(f"user_{self.user_id}", self.channel_name)
            logger.info(f"Utilisateur {self.user_id} est maintenant hors ligne.")

        await self.channel_layer.group_discard("gateway", self.channel_name)
        logger.info(f"Client {self.user_id} déconnecté du Gateway")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            author = self.user_id

            if message_type == "chat_message":
                data["author"] = author
                await self.channel_layer.group_send("chat_service", data)
                logger.info(f"Message général relayé à 'chat_service' depuis {author}")

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
                logger.info(f"Message privé envoyé à user_{recipient} depuis {author}")

            elif message_type == "info_message":
                logger.info(f"Message d'information reçu: {data}")
                recipient = data.get("recipient")
                if not recipient:
                    await self.send(json.dumps({"error": "Recipient is required for friend requests"}))
                    return
                logger.info(f"data: {data}")
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
                logger.info(f"Message de tournoi reçu: {data}")
                if data.get("action") == "leave_online_tournament":
                    data["user_id"] = self.user_id
                elif data.get("action") == "join_tournament" or data.get("action") == "reject_tournament":
                    data["userId"] = self.user_id
                elif data.get("action") == "create_online_tournament":
                    data["organizer_id"] = self.user_id
                await self.channel_layer.group_send("tournament_service", data)
                logger.info("Message général relayé à 'tournament_service")

            elif data.get("type") == "game_event":
                player1_id = data.get("player1", "Player 1")
                player2_id = data.get("player2", "Player 2")

                if data.get("action") == "start_game":
                    game_id = data.get("game_id", "unknown_game")
                    self.game_id = game_id
                    await self.channel_layer.group_add(f"game_{self.game_id}", self.channel_name)
                    logger.info(f"Client rejoint le groupe game_{self.game_id}")
                    logger.info(f"Envoi à pong_service: self.game_id={self.game_id}, player1={player1_id}, player2={player2_id}")
                if data.get("action") == "give_up":
                    await self.channel_layer.group_discard(f"game_{self.game_id}", self.channel_name)
                    logger.info(f"Client quitte le groupe game_{self.game_id}")
                    logger.info(f"Envoi à pong_service: game_id={self.game_id}, player1={player1_id}, player2={player2_id}")

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

                    },
                )

            elif data.get("type") in ["matchmaking", "private_event"]:
                action = data.get("action")
                logger.info(f"matchmaking_event/private_event => service : {action} {self.user_id}")
                room_code = data.get("room_code")

                await self.channel_layer.group_send(
                    "matchmaking_service",
                    {
                        "type": "matchmaking_event",
                        "action": action,
                        "user_id": str(self.user_id),
                        "room_code": str(room_code),
                    },
                )
                logger.info(f"matchmaking_event/private_event => service : {action} {self.user_id}, room={room_code}")

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
        if action == "back_tournament_invite" or action == "back_join_tournament" or action == "back_reject_tournament" or action == "back_cancel_tournament_invite" or action == "back_kick_tournament" or action == "back_cancel_tournament" or action == "back_leave_tournament" or action == "back_tournament_game_over":
            await self.channel_layer.group_send("chat_service", event)
            logger.info(f"Message transmis au chat_service (back_tournament): {event}")
        else:
            await self.send(json.dumps(event))
            logger.info(f"Message transmis au client WebSocket (info_message): {event}")

    async def tournament_message(self, event):
        await self.send(json.dumps(event))
        logger.info(f"Message transmis au client WebSocket (Tournament Request): {event}")

    async def error_message(self, event):
        """This method handles error_message events delivered to this consumer."""
        await self.send(json.dumps(event))
        logger.info(f"Message d'erreur transmis au client WebSocket (Private): {event}")

    async def game_state(self, event):
        await self.send(json.dumps(event))

    async def game_over(self, event):
        """Gère la fin du jeu et envoie le message au client."""
        await self.send(json.dumps(event))
        logger.info(f"🚨 Game over transmis au client WebSocket : {event}")

    async def leave_game(self, event):
        logger.info(f" leave_game tst")

    async def match_found(self, event):
        await self.send(json.dumps(event))
        logger.info(f"🎯 Match trouvé! Envoyé au client {event['user_id']}")

    async def private_match_found(self, event):
        await self.send(json.dumps(event))
        logger.info(f"🔔 Private match_found envoyé au client {event['user_id']} : self.game_id={event['game_id']}, side={event['side']}")

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


async def fetch_user_id(cookies):
    async with httpx.AsyncClient(base_url="https://auth_service:3001", verify=False) as client:
        response = await client.get("/get_user_id_from_cookie/", cookies=cookies)
        if response.status_code == 200:
            data = response.json()
            return data.get("user_id")
        else:
            logger.error(f"Erreur lors de la récupération de l'ID utilisateur: {response.text}")
            return None
