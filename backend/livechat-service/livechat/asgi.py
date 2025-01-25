# asgi.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'livechat.settings')

# Force Django’s app registry to load
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from livechat.routing import websocket_urlpatterns

# Create the standard ASGI Django application
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # Handles standard HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})