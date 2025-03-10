from django.urls import path  # type: ignore
from .consumers import MatchmakingConsumer

websocket_urlpatterns = [
    path("wss/matchmaking/", MatchmakingConsumer.as_asgi()),
]
