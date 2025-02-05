# pong_service/routing.py
from django.urls import path
from .consumers import PongGroupConsumer

websocket_urlpatterns = [
    path("ws/pong/", PongGroupConsumer.as_asgi()),
]
