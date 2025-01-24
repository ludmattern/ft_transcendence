# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "general"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'friend_request':
            await self.handle_friend_request(data)
        elif message_type == 'tournament_invite':
            await self.handle_tournament_invite(data)

    async def handle_chat_message(self, data):
        message = data['message']
        username = data['username']
        channel = data.get('channel', 'General')

        if message.startswith('@'):
            recipient, private_message = message.split(' ', 1)
            recipient_username = recipient[1:]
            await self.send_private_message(username, recipient_username, private_message)
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                    'channel': channel
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_private_message(self, sender, recipient, message):
        recipient_user = await self.get_user(recipient)
        if recipient_user:
            await self.channel_layer.group_send(
                f"user_{recipient}",
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': sender,
                    'channel': 'Private'
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'error': f"User {recipient} not found."
            }))

    async def handle_friend_request(self, data):
        # Implement friend request logic here
        pass

    async def handle_tournament_invite(self, data):
        # Implement tournament invite logic here
        pass

    @sync_to_async
    def get_user(self, username):
        try:
            return ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return None