from django.urls import path # type: ignore
from service.consumers import AuthConsumer

websocket_urlpatterns = [
    path("wss/auth/", AuthConsumer.as_asgi()),
]
