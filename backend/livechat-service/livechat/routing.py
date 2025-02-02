from django.urls import path
from service.consumers import ChatConsumer

websocket_urlpatterns = [
    path("ws/chat/", ChatConsumer.as_asgi()),
]
