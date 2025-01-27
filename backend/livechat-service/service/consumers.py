# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
from .models import ManualUser  # Adjust the import path based on your project structure

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = None
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        
        # Fetch user asynchronously
        self.user = await self.get_user(self.user_id)
        
        if not self.user:
            logger.warning(f"No user found with id: {self.user_id}")
            await self.close()
            return
        
        self.group_name = f'chat_{self.user.id}'
        
        # Add the channel to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connection accepted for user_id: {self.user_id}")

    @sync_to_async
    def get_user(self, user_id):
        try:
            return ManualUser.objects.get(id=user_id)
        except ManualUser.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"WebSocket connection closed for user_id: {self.user_id}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        
        if not message:
            await self.send(text_data=json.dumps({'error': 'No message provided.'}))
            logger.warning(f"No message provided by user_id {self.user_id}.")
            return
        
        if len(message) > 1000:
            await self.send(text_data=json.dumps({'error': 'Message too long.'}))
            logger.warning(f"User_id {self.user_id} sent a message that's too long.")
            return
        
        # Broadcast the message to the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user_id,
            }
        )
        logger.debug(f"Message received from user_id {self.user_id}: {message}")

    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id,
        }))
        logger.debug(f"Message sent to user_id {self.user_id}: {message}")
