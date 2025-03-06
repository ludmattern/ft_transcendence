# gateway_service/apps.py

from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class GatewayServiceConfig(AppConfig):
    name = "gateway_service"

    def ready(self):
        from service.gateway_connection import start_dummy_gateway_connection

        start_dummy_gateway_connection()
        logger.info("Dummy gateway connection lancée.")

        from service.chat_connection import start_dummy_chat_connection

        start_dummy_chat_connection()
        logger.info("Dummy chat connection lancée.")

        from service.pong_connection import start_dummy_pong_connection

        start_dummy_pong_connection()
        logger.info("Dummy pong connection lancée.")

        from service.matchmaking_connection import start_dummy_matchmaking_connection

        start_dummy_matchmaking_connection()
        logger.info("Dummy matchmaking connection lancée.")

        from service.tournament_connection import start_dummy_tournament_connection

        start_dummy_tournament_connection()
        logger.info("Dummy tournament connection lancée.")

        from service.auth_connection import start_dummy_auth_connection

        start_dummy_auth_connection()
        logger.info("Dummy auth connection lancée.")
