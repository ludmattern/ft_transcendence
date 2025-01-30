# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
from .models import ManualUser  # Adjust the import path based on your project structure
from datetime import datetime
import re

logger = logging.getLogger(__name__)

def get_current_timestamp():
    now = datetime.now()  # ou utcnow() selon votre besoin
    return now.isoformat()  # ex: '2025-01-30T14:45:32.123456'

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        
        # Fetch user asynchronously
        self.user = await self.get_user(self.user_id)
        
        if not self.user:
            logger.warning(f"No user found with id: {self.user_id}")
            await self.close()
            return
        
        # Define group names
        self.general_group = 'general_chat'
        self.personal_group = f'personal_chat_{self.user.id}'
        
        # Join general and personal groups
        await self.channel_layer.group_add(
            self.general_group,
            self.channel_name
        )
        logger.info(f"User {self.user_id} joined group {self.general_group}")
        
        await self.channel_layer.group_add(
            self.personal_group,
            self.channel_name
        )
        logger.info(f"User {self.user_id} joined group {self.personal_group}")
        
        await self.accept()
        logger.info(f"WebSocket connection accepted for user_id: {self.user_id}")

    async def disconnect(self, close_code):
        # Leave groups
        await self.channel_layer.group_discard(
            self.general_group,
            self.channel_name
        )
        logger.info(f"User {self.user_id} left group {self.general_group}")
        
        await self.channel_layer.group_discard(
            self.personal_group,
            self.channel_name
        )
        logger.info(f"User {self.user_id} left group {self.personal_group}")
        
        logger.info(f"WebSocket connection closed for user_id: {self.user_id}")

    @sync_to_async
    def get_user(self, user_id):
        try:
            return ManualUser.objects.get(id=user_id)
        except ManualUser.DoesNotExist:
            return None

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '').strip()
            channel = data.get('channel', 'general').capitalize()  # Ensure proper casing
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON.'}))
            logger.error(f"Invalid JSON received from user_id {self.user_id}.")
            return
        
        if not message:
            await self.send(text_data=json.dumps({'error': 'No message provided.'}))
            logger.warning(f"No message provided by user_id {self.user_id}.")
            return
        
        if len(message) > 1000:
            await self.send(text_data=json.dumps({'error': 'Message too long.'}))
            logger.warning(f"User_id {self.user_id} sent a message that's too long.")
            return
        
        # Detect @username for private messages
        private_matches = re.findall(r'@(\w+)', message)
        private_recipients = []
        for username in private_matches:
            user = await self.get_user_by_username(username)
            if user:
                private_recipients.append(user.id)
            else:
                logger.warning(f"@{username} mentioned by user_id {self.user_id} does not exist.")
        
        # Determine target groups
        target_groups = set()
        if channel == 'general':
            target_groups.add(self.general_group)
        elif channel == 'personal':
            target_groups.add(self.personal_group)
        elif channel == 'private' and private_recipients:
            for recipient_id in private_recipients:
                # Create a unique group for each pair (sorted to avoid duplication)
                sorted_ids = sorted([self.user.id, recipient_id])
                private_group = f'private_chat_{sorted_ids[0]}_{sorted_ids[1]}'
                target_groups.add(private_group)
        else:
            # If channel is unrecognized, default to 'General'
            target_groups.add(self.general_group)
            channel = 'general'
            logger.info(f"Unrecognized channel '{channel}' by user_id {self.user_id}. Defaulting to 'general'.")
        
        # Prepare the message payload
        payload = {
            'message': message,
            'sender_id': self.user.id,
            'channel': channel,
            'timestamp': get_current_timestamp(),
        }
        
        # Send the message to all target groups
        for group in target_groups:
            await self.channel_layer.group_send(
                group,
                {
                    'type': 'chat_message',
                    'message': payload['message'],
                    'sender_id': payload['sender_id'],
                    'channel': payload['channel'],
                    'timestamp': payload['timestamp'],
                }
            )
            logger.debug(f"Message from user_id {self.user_id} sent to group {group} on channel {channel}.")
        
    async def chat_message(self, event):
        """
        Handler for messages sent to groups.
        """
        message = event['message']
        sender_id = event['sender_id']
        channel = event.get('channel', 'general')
        timestamp = event.get('timestamp', get_current_timestamp())
        
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id,
            'channel': channel,
            'timestamp': timestamp,
        }))
        logger.debug(f"Message sent to user_id {self.user_id}: {message} on {channel} at {timestamp}")

    @sync_to_async
    def get_user_by_username(self, username):
        try:
            return ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return None