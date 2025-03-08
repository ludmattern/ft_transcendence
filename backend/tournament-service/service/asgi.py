import os
import django  # type: ignore

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tournament.settings")
django.setup()

from django.core.asgi import get_asgi_application  # type: ignore # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # type: ignore # noqa: E402
from channels.auth import AuthMiddlewareStack  # type: ignore # noqa: E402
from .routing import websocket_urlpatterns  # noqa: E402


django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
