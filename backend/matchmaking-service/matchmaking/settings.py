# matchmaking-service
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

MIGRATION_MODULES = {
    "auth": None,
    "contenttypes": None,
}

ROOT_URLCONF = "matchmaking.urls"
ASGI_APPLICATION = "service.asgi.application"
