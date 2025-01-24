import json
from channels.generic.websocket import AsyncWebsocketConsumer

game_state = {
    "x": 0,
    "y": 0
}

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "pong_game"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send(json.dumps({
            "type": "position",
            "x": game_state["x"],
            "y": game_state["y"]
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") == "move":
            direction = data.get("direction")
            if direction == "up":
                game_state["y"] += 0.1
            elif direction == "down":
                game_state["y"] -= 0.1
            elif direction == "left":
                game_state["x"] -= 0.1
            elif direction == "right":
                game_state["x"] += 0.1

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "position_update",
                    "x": game_state["x"],
                    "y": game_state["y"]
                }
            )

    async def position_update(self, event):
        x = event["x"]
        y = event["y"]

        await self.send(text_data=json.dumps({
            "type": "position",
            "x": x,
            "y": y
        }))
