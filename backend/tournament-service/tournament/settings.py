#matchmaking-service
from common.common_settings import *

INSTALLED_APPS = COMMON_INSTALLED_APPS + [
	'channels',
]

MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,
}

ASGI_APPLICATION = 'service.asgi.application'

ROOT_URLCONF = 'tournament.urls'
WSGI_APPLICATION = 'service.wsgi.application'



try:
	with open('/run/secrets/fernet_key', 'r') as f:
		FERNET_KEY = f.read().strip()
except Exception:
	print("Error reading Fernet key from file")