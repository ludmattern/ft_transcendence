#pong-service
import sys

from common.common_settings import *

sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))

INSTALLED_APPS = COMMON_INSTALLED_APPS + [
	'channels',
]

MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,
}

ROOT_URLCONF = 'pong.urls'
ASGI_APPLICATION = 'pong.asgi.application'
