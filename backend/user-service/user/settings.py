# user-service
import os
from common.common_settings import *  # noqa: F403

INSTALLED_APPS = COMMON_INSTALLED_APPS  # noqa: F405

ROOT_URLCONF = "user.urls"
WSGI_APPLICATION = "user.wsgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media") # noqa: F405

JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600
try:
    with open("/run/secrets/fernet_key", "r", encoding="utf-8") as f:
        FERNET_KEY = f.read().strip()
    with open("/run/secrets/jwt_secret", "r", encoding="utf-8") as f:
        JWT_SECRET_KEY = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")
