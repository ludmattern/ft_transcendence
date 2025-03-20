# gateway_service/apps.py

from django.apps import AppConfig  # type: ignore
import logging

logger = logging.getLogger(__name__)


class GatewayServiceConfig(AppConfig):
    name = "gateway_service"

    def ready(self):
        from service.gateway_connection import start_dummy_gateway_connection

        start_dummy_gateway_connection()
        logger.info("Dummy gateway connection started.")

        from service.chat_connection import start_dummy_chat_connection

        start_dummy_chat_connection()
        logger.info("Dummy chat connection started.")

        from service.pong_connection import start_dummy_pong_connection

        start_dummy_pong_connection()
        logger.info("Dummy pong connection started.")

        from service.matchmaking_connection import start_dummy_matchmaking_connection

        start_dummy_matchmaking_connection()
        logger.info("Dummy matchmaking connection started.")

        from service.tournament_connection import start_dummy_tournament_connection

        start_dummy_tournament_connection()
        logger.info("Dummy tournament connection started.")

        from service.auth_connection import start_dummy_auth_connection

        start_dummy_auth_connection()
        logger.info("Dummy auth connection started.")
