# matchmaking-service
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

MIGRATION_MODULES = {
    "auth": None,
    "contenttypes": None,
}

ASGI_APPLICATION = "service.asgi.application"

ROOT_URLCONF = "tournament.urls"
WSGI_APPLICATION = "service.wsgi.application"


JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600


try:
    with open("/run/secrets/fernet_key", "r") as f:
        FERNET_KEY = f.read().strip()
    with open("/run/secrets/jwt_secret", "r") as f:
        JWT_SECRET_KEY = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")
