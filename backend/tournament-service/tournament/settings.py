#matchmaking-service
from common.common_settings import *

INSTALLED_APPS = COMMON_INSTALLED_APPS + [
	'channels',
]

MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,
}

ROOT_URLCONF = 'matchmaking.urls'
ASGI_APPLICATION = 'service.asgi.application'
