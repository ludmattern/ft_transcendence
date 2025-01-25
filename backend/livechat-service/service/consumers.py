# consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)

from service.models import ManualUser # Will cause an error because of the fact that this is ASGI and not WSGI, will need to do a Lazy import.


class ChatConsumer(AsyncWebsocketConsumer):

    user = ManualUser.objects.get(username=username)