from django.urls import path  # type: ignore
from .consumers import TournamentConsumer

websocket_urlpatterns = [
    path("ws/tournament/", TournamentConsumer.as_asgi()),
]
