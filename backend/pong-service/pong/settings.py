# pong-service
import sys
import os

from common.common_settings import *  # noqa: F403

sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))  # noqa: F405

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

MIGRATION_MODULES = {
    "auth": None,
    "contenttypes": None,
}

ROOT_URLCONF = "pong.urls"
ASGI_APPLICATION = "pong.asgi.application"

try:
    with open("/run/secrets/django_secret", "r", encoding="utf-8") as f:
        DJANGO_SECRET = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")
    
    
SECRET_KEY = DJANGO_SECRET