import asyncio
import logging
import websockets  # type: ignore
import threading
import ssl

logger = logging.getLogger(__name__)


async def connect_dummy_matchmaking():
    ws_url = "wss://matchmaking-service:3005/wss/matchmaking/"
    while True:
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.load_verify_locations("/data/certs/selfsigned.crt")

            logger.info("Trying to connect to MatchmakingConsumer with: %s", ws_url)
            async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                logger.info("Connection established to MatchmakingConsumer.")
                while True:
                    message = await websocket.recv()
                    logger.info("Dummy Matchmaking received : %s", message)
        except Exception as e:
            logger.error("Error connecting to MatchmakingConsumer dummy: %s", e)
            await asyncio.sleep(5)


def run_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


def start_dummy_matchmaking_connection():
    new_loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(new_loop,), daemon=True)
    t.start()
    asyncio.run_coroutine_threadsafe(connect_dummy_matchmaking(), new_loop)
