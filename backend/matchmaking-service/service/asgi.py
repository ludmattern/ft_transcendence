import os
import django  # type: ignore
from django.core.asgi import get_asgi_application  # type: ignore
from channels.routing import ProtocolTypeRouter, URLRouter  # type: ignore
from channels.auth import AuthMiddlewareStack  # type: ignore
from .routing import websocket_urlpatterns  # type: ignore

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "matchmaking.settings")
django.setup()

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
