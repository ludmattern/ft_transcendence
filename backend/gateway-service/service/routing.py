from django.urls import path  # type: ignore
from service.consumers import GatewayConsumer

websocket_urlpatterns = [
    path("wss/gateway/", GatewayConsumer.as_asgi()),
]
