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
            async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                while True:
                    await websocket.recv()
        except Exception as e:
            logger.error("Error connecting to ChatConsumer dummy: %s", e)
            await asyncio.sleep(5)


def run_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


def start_dummy_chat_connection():
    new_loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(new_loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(connect_dummy_chat(), new_loop)
