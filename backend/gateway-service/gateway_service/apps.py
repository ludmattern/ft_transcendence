# gateway_service/apps.py

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class GatewayServiceConfig(AppConfig):
    name = 'gateway_service'

    def ready(self):
        from service.chat_connection import start_dummy_chat_connection
        start_dummy_chat_connection()
        logger.info("Dummy chat connection lancée.")
