import uuid
import logging

logger = logging.getLogger(__name__)


class PrivateManager:
    def __init__(self):
        self.waiting_rooms = {}
        self.match_found = {}

    def join_room(self, room_code, user_id):
        logging.info(f"User {user_id} joined room {room_code}")
        if room_code not in self.waiting_rooms:
            self.waiting_rooms[room_code] = []
        if user_id not in self.waiting_rooms[room_code]:
            self.waiting_rooms[room_code].append(user_id)

        if len(self.waiting_rooms[room_code]) >= 2:
            p1 = self.waiting_rooms[room_code].pop(0)
            p2 = self.waiting_rooms[room_code].pop(0)
            game_id = room_code

            match_info_p1 = {
                "game_id": game_id,
                "players": [p1, p2],
                "opponent_id": p2,
                "side": "left",
            }
            match_info_p2 = {
                "game_id": game_id,
                "players": [p1, p2],
                "opponent_id": p1,
                "side": "right",
            }
            self.match_found[p1] = match_info_p1
            self.match_found[p2] = match_info_p2

            return self.match_found[user_id]
        return None

    def remove_from_room(self, room_code, user_id):
        if room_code in self.waiting_rooms and user_id in self.waiting_rooms[room_code]:
            self.waiting_rooms[room_code].remove(user_id)
        if user_id in self.match_found:
            del self.match_found[user_id]


private_manager = PrivateManager()
