# common_settings.py
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEBUG = True
ALLOWED_HOSTS = []
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'

# Configuration de la base de données commune (pour les services PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'postgres'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'postgres_db'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Configuration commune de Channels (pour les services qui en ont besoin)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
            "capacity": 10000,
        },
    },
}

# Applications communes pour les services utilisant Channels
COMMON_INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'service',
    'channels',
]
