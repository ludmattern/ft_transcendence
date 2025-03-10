from django.urls import path  # type: ignore
from service.consumers import ChatConsumer

websocket_urlpatterns = [
    path("wss/chat/", ChatConsumer.as_asgi()),
]
