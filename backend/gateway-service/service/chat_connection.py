# service/chat_connection.py
import asyncio
import logging
import websockets  # type: ignore
import threading
import ssl

logger = logging.getLogger(__name__)


async def connect_dummy_chat():
    ws_url = "wss://livechat-service:3003/wss/chat/"
    while True:
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.load_verify_locations("/data/certs/selfsigned.crt")
            logger.info("Tentative de connexion au ChatConsumer via %s", ws_url)
            async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                # async with websockets.connect(ws_url) as websocket:
                logger.info("Connexion dummy établie au ChatConsumer.")
                while True:
                    message = await websocket.recv()
                    logger.info("Dummy a reçu : %s", message)
        except Exception as e:
            logger.error("Erreur de connexion dummy au ChatConsumer : %s", e)
            await asyncio.sleep(5)


def run_loop(loop):
    """Fonction qui exécute un event loop dans un thread."""
    asyncio.set_event_loop(loop)
    loop.run_forever()


def start_dummy_chat_connection():
    new_loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(new_loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(connect_dummy_chat(), new_loop)
