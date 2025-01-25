# consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Initialize group_name to None
            self.group_name = None

            # Extract the user_id from the URL route
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            
            # Get the authenticated user from the scope
            self.user = self.scope["user"]

            # Verify if the user is authenticated
            if self.user.is_anonymous:
                logger.warning("Anonymous user attempted to connect.")
                await self.close()
                return

            # Verify if the user_id matches the authenticated user's ID
            if str(self.user.id) != self.user_id:
                logger.warning(f"User ID mismatch: {self.user.id} != {self.user_id}")
                await self.close()
                return

            # Define the group name based on user_id
            self.group_name = f'chat_{self.user_id}'

            # Add the channel to the group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            # Accept the WebSocket connection
            await self.accept()
            logger.info(f"WebSocket connection accepted for user_id: {self.user_id}")

        except Exception as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        # Check if 'group_name' has been set
        if self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"WebSocket connection closed for user_id: {self.user_id}")
        else:
            logger.info(f"WebSocket connection closed without group for user_id: {getattr(self, 'user_id', 'unknown')}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message')

            if not message:
                await self.send(text_data=json.dumps({
                    'error': 'No message provided.'
                }))
                logger.warning(f"No message provided by user_id {self.user_id}.")
                return

            if len(message) > 1000:
                await self.send(text_data=json.dumps({
                    'error': 'Message too long.'
                }))
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

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON format received from user_id {self.user_id}.")
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format.'
            }))

    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id,
        }))
        logger.debug(f"Message sent to user_id {self.user_id}: {message}")
