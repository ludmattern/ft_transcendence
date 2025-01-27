from django.urls import path
from service.consumers import ChatConsumer

websocket_urlpatterns = [
    path("ws/chat/<str:user_id>/", ChatConsumer.as_asgi()),
]
