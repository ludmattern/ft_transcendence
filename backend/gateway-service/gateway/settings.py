#gateway-service
from common.common_settings import *

INSTALLED_APPS = COMMON_INSTALLED_APPS + [
	'gateway_service',
	'channels',
]

MIGRATION_MODULES = {
	'auth': None,
	'contenttypes': None,
}

ASGI_APPLICATION = 'gateway.asgi.application'


