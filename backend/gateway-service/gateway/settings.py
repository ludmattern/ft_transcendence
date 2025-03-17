# gateway-service
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "gateway_service",
    "channels",
]

MIGRATION_MODULES = {
    "auth": None,
    "contenttypes": None,
}

ASGI_APPLICATION = "gateway.asgi.application"


try:
    with open("/run/secrets/django_secret", "r", encoding="utf-8") as f:
        DJANGO_SECRET = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")
    
    
SECRET_KEY = DJANGO_SECRET