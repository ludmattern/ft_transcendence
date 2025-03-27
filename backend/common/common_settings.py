# common_settings.py
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEBUG = False
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"

try:
    with open("/run/secrets/hostname", "r", encoding="utf-8") as f:
        HOSTNAME = f.read().strip()
except Exception:
    print("Error reading hostname from file")

ALLOWED_HOSTS = [HOSTNAME]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
    }
}

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASS = os.getenv("REDIS_PASS")

address = f"redis://:{REDIS_PASS}@{REDIS_HOST}:{REDIS_PORT}/0" if REDIS_PASS else f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [{"address": address}],
            "capacity": 10000,
        },
    },
}


COMMON_INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "service",
]
