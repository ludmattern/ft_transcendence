# auth-service
import sys
from common.common_settings import *  # noqa: F403

sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))  # noqa: F405

INSTALLED_APPS = COMMON_INSTALLED_APPS + [  # noqa: F405
    "channels",
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')], # noqa: F405
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


ROOT_URLCONF = "auth.urls"

WSGI_APPLICATION = "auth.wsgi.application"
ASGI_APPLICATION = "auth.asgi.application"

JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3000

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_USE_TLS = True
EMAIL_PORT = 587

try:
    with open("/run/secrets/fernet_key", "r", encoding="utf-8") as f:
        FERNET_KEY = f.read().strip()
    with open("/run/secrets/smtp_host_user", "r", encoding="utf-8") as f:
        EMAIL_HOST_USER = f.read().strip()
    with open("/run/secrets/smtp_host_password", "r", encoding="utf-8") as f:
        EMAIL_HOST_PASSWORD = f.read().strip()
    with open("/run/secrets/twilio_account_sid", "r", encoding="utf-8") as f:
        TWILIO_ACCOUNT_SID = f.read().strip()
    with open("/run/secrets/twilio_auth_token", "r", encoding="utf-8") as f:
        TWILIO_AUTH_TOKEN = f.read().strip()
    with open("/run/secrets/twilio_phone_number", "r", encoding="utf-8") as f:
        TWILIO_PHONE_NUMBER = f.read().strip()
    with open("/run/secrets/42_uid", "r", encoding="utf-8") as f:
        UID_42 = f.read().strip()
    with open("/run/secrets/42_secret", "r", encoding="utf-8") as f:
        SECRET_42 = f.read().strip()
    with open("/run/secrets/hostname", "r", encoding="utf-8") as f:
        HOSTNAME = f.read().strip()
    with open("/run/secrets/jwt_secret", "r", encoding="utf-8") as f:
        JWT_SECRET_KEY = f.read().strip()
except Exception:
    print("Error reading Fernet key from file")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
