# livechat-service
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

ROOT_URLCONF = "livechat.urls"

WSGI_APPLICATION = "livechat.wsgi.application"
ASGI_APPLICATION = "livechat.asgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

try:
    with open("/run/secrets/django_secret", "r", encoding="utf-8") as f:
        DJANGO_SECRET = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")
    
    
SECRET_KEY = DJANGO_SECRET