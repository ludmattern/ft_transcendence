# auth-service
import sys

from common.common_settings import *

sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))

from cryptography.fernet import Fernet

INSTALLED_APPS = [
    'service',
]

ROOT_URLCONF = 'auth.urls'

WSGI_APPLICATION = 'auth.wsgi.application'

JWT_SECRET_KEY = secrets.token_urlsafe(64)
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3000

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'sendertran115@gmail.com'
EMAIL_HOST_PASSWORD = 'rgph iima ghns xhwy'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

FERNET_KEY = os.getenv('FERNET_KEY')