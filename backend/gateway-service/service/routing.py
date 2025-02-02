from django.urls import path
from service.consumers import GatewayConsumer

websocket_urlpatterns = [
    path("ws/gateway/", GatewayConsumer.as_asgi()),
]
