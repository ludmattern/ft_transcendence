# auth-service
import sys
from common.common_settings import *

sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))

INSTALLED_APPS = COMMON_INSTALLED_APPS + [
	'channels',
]

ROOT_URLCONF = 'auth.urls'

WSGI_APPLICATION = 'auth.wsgi.application'
ASGI_APPLICATION = 'auth.asgi.application'

JWT_SECRET_KEY = secrets.token_urlsafe(64)	
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3000

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587

try:
	with open('/run/secrets/fernet_key', 'r') as f:
		FERNET_KEY = f.read().strip()
	with open('/run/secrets/smtp_host_user', 'r') as f:
		EMAIL_HOST_USER = f.read().strip()
	with open('/run/secrets/smtp_host_password', 'r') as f:
		EMAIL_HOST_PASSWORD = f.read().strip()
	with open('/run/secrets/twilio_account_sid', 'r') as f:
		TWILIO_ACCOUNT_SID = f.read().strip()
	with open('/run/secrets/twilio_auth_token', 'r') as f:
		TWILIO_AUTH_TOKEN = f.read().strip()
	with open('/run/secrets/twilio_phone_number', 'r') as f:
		TWILIO_PHONE_NUMBER = f.read().strip()
except Exception:
	print("Error reading Fernet key from file")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER