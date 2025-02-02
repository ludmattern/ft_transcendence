import os
import secrets

SECRET_KEY = secrets.token_urlsafe(64)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = [
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'service',  # L'app WebSocket
	'gateway_service',  # Ajoutez cette ligne
	'channels',  # Channels pour WebSockets
]

MIGRATION_MODULES = {
	'auth': None,
	'contenttypes': None,

}

# ROOT_URLCONF = 'pong.urls'

ASGI_APPLICATION = 'gateway.asgi.application'

CHANNEL_LAYERS = {
	"default": {
		"BACKEND": "channels_redis.core.RedisChannelLayer",
		"CONFIG": {
			"hosts": [("redis-livechat", 6379)],
		},
	},
}

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.sqlite3',
		'NAME': ':memory:',
	}
}


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = '/static/'
