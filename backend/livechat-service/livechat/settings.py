# livechat-service
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

ROOT_URLCONF = "livechat.urls"

WSGI_APPLICATION = "livechat.wsgi.application"
ASGI_APPLICATION = "livechat.asgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
