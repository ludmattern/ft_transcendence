import asyncio
import logging
import websockets  # type: ignore
import threading
import ssl

logger = logging.getLogger(__name__)


async def connect_dummy_auth():
    ws_url = "wss://auth-service:3001/wss/auth/"
    while True:
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.load_verify_locations("/data/certs/selfsigned.crt")
            async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                while True:
                    await websocket.recv()
        except Exception as e:
            logger.error("Error connecting to AuthGroupConsumer dummy: %s", e)
            await asyncio.sleep(5)


def run_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


def start_dummy_auth_connection():
    new_loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(new_loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(connect_dummy_auth(), new_loop)
