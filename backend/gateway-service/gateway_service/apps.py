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

        from service.pong_connection import start_dummy_pong_connection
        start_dummy_pong_connection()
        logger.info("Dummy pong connection lancée.")
        
        from service.matchmaking_connection import start_dummy_matchmaking_connection
        start_dummy_matchmaking_connection()
        logger.info("Dummy matchmaking connection lancée.")