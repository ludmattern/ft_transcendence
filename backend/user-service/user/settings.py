#user-service
from common.common_settings import *

INSTALLED_APPS = COMMON_INSTALLED_APPS

ROOT_URLCONF = 'user.urls'
WSGI_APPLICATION = 'user.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


try:
	with open('/run/secrets/fernet_key', 'r') as f:
		FERNET_KEY = f.read().strip()
except Exception:
	print("Error reading Fernet key from file")