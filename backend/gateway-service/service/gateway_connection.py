import asyncio
import logging
import websockets  # type: ignore
import threading
import ssl
import json
from datetime import datetime

logger = logging.getLogger(__name__)


async def connect_dummy_gateway():
    ws_url = "wss://gateway-service:3006/wss/gateway/?dummy=true"
    while True:
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.load_verify_locations("/data/certs/selfsigned.crt")

            logger.info("Tentative de connexion au Gateway Consumer via %s", ws_url)
            async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                logger.info("Connexion dummy établie au Gateway Consumer.")
                init_payload = {
                    "type": "init",
                    "userId": 0,
                    "username": "dummy",
                    "timestamp": str(datetime.now()),
                }
                await websocket.send(json.dumps(init_payload))
                while True:
                    message = await websocket.recv()
                    logger.info("Dummy gateway a reçu : %s", message)
        except Exception as e:
            logger.error("Erreur de connexion dummy au Gateway Consumer : %s", e)
            await asyncio.sleep(5)


def run_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


def start_dummy_gateway_connection():
    new_loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(new_loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(connect_dummy_gateway(), new_loop)
