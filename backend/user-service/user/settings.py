#user-service
from common.common_settings import *

from cryptography.fernet import Fernet

INSTALLED_APPS = COMMON_INSTALLED_APPS

ROOT_URLCONF = 'user.urls'
WSGI_APPLICATION = 'user.wsgi.application'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
FERNET_KEY = os.getenv('FERNET_KEY')