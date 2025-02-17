#pong-service

import os
import sys
import secrets

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "/app", "common"))

from common_settings import *

SECRET_KEY = secrets.token_urlsafe(64)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = True

ALLOWED_HOSTS = []

MIGRATION_MODULES = {
    'auth': None,
    'contenttypes': None,

}

ROOT_URLCONF = 'pong.urls'

ASGI_APPLICATION = 'pong.asgi.application'
