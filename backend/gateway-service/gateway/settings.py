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
