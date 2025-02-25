from django.urls import path
from service.consumers import AuthConsumer

websocket_urlpatterns = [
    path("ws/auth/", AuthConsumer.as_asgi()),
]
