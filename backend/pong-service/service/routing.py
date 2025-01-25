from django.urls import path
from service.consumers import PongConsumer

websocket_urlpatterns = [
    path('ws/pong/<str:game_id>/', PongConsumer.as_asgi()),
]