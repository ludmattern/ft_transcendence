from django.urls import path  # type: ignore
from .consumers import TournamentConsumer

websocket_urlpatterns = [
    path("wss/tournament/", TournamentConsumer.as_asgi()),
]
