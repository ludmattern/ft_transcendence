from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Connexion au chat-service (uniquement utilisé par le Gateway)"""
        await self.accept()

        await self.channel_layer.group_add("chat_service", self.channel_name)
        logger.info("🔗 `livechat-service` connecté au Gateway")

    async def receive(self, text_data):
        """Traite tous les messages venant du `gateway-service`"""
        data = json.loads(text_data)
        event_type = data.get("type")

        if event_type == "chat_message":
            await self.handle_chat_message(data)
        elif event_type == "private_message":
            await self.handle_private_message(data)

    async def handle_chat_message(self, data):
        """Gère les messages publics"""
        sender = data["sender_id"]
        message = data["message"]
        timestamp = data["timestamp"]

        await self.channel_layer.group_send(
            "chat_general",
            {
                "type": "chat_message",
                "message": message,
                "sender_id": sender,
                "channel": "general",
                "timestamp": timestamp,
            }
        )
        logger.info(f"📨 Message public de {sender}")

    async def handle_private_message(self, data):
        """Gère les messages privés et gère automatiquement les groupes"""
        sender = data["sender_id"]
        recipient = data["recipient"]
        message = data["message"]
        timestamp = data["timestamp"]

        chat_group = f"private_chat_{'_'.join(sorted([sender, recipient]))}"

        # Ajouter les deux utilisateurs au groupe si ce n'est pas déjà fait
        await self.channel_layer.group_add(chat_group, self.channel_name)

        await self.channel_layer.group_send(
            chat_group,
            {
                "type": "chat_message",
                "message": message,
                "sender_id": sender,
                "recipient": recipient,
                "channel": "private",
                "timestamp": timestamp,
            }
        )
        logger.info(f"📨 Message privé entre {sender} et {recipient}")

    async def chat_message(self, event):
        """Envoie le message au `gateway-service`, qui le retransmet aux utilisateurs"""
        await self.channel_layer.group_send("gateway", event)
