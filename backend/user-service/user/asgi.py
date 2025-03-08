# user/asgi.py

import os
import django  # type: ignore
from django.core.asgi import get_asgi_application  # type: ignore

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "user.settings")
django.setup()

application = get_asgi_application()
