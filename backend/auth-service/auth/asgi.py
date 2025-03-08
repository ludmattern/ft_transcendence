import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth.settings")

import django  # type: ignore

django.setup()

from django.core.asgi import get_asgi_application  # type: ignore # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # type: ignore # noqa: E402
from channels.auth import AuthMiddlewareStack  # type: ignore # noqa: E402
from auth.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
