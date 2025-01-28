# service/private_manager.py
import uuid
from .game_manager import game_manager

class PrivateManager:
    """
    Gère l'attente par room code, de la même façon
    que matchmaking_manager gère la file globale.
    """

    def __init__(self):
        self.waiting_rooms = {}
        self.match_found = {}

    def join_room(self, room_code, user_id):
        """
        Le user_id rejoint la "room" nommée room_code.
        S'il y a déjà 1 joueur dedans, on génère un game_id et on matche.
        Sinon, on reste waiting.
        """
        if user_id in self.match_found:
            return self.match_found[user_id]

        if room_code not in self.waiting_rooms:
            self.waiting_rooms[room_code] = []
        if user_id not in self.waiting_rooms[room_code]:
            self.waiting_rooms[room_code].append(user_id)

        if len(self.waiting_rooms[room_code]) >= 2:
            p1 = self.waiting_rooms[room_code].pop(0)
            p2 = self.waiting_rooms[room_code].pop(0)

            game_id = f"private_{uuid.uuid4()}"
            game_manager.get_or_create_game(game_id)

            match_info_p1 = {
                "game_id": game_id,
                "players": [p1, p2],
                "side": "left"
            }
            match_info_p2 = {
                "game_id": game_id,
                "players": [p1, p2],
                "side": "right"
            }
            self.match_found[p1] = match_info_p1
            self.match_found[p2] = match_info_p2

            if user_id == p1:
                return match_info_p1
            else:
                return match_info_p2

        return None

    def remove_from_room(self, room_code, user_id):
        """
        Retirer user_id de la room waiting_rooms
        et de match_found si besoin
        """
        if room_code in self.waiting_rooms and user_id in self.waiting_rooms[room_code]:
            self.waiting_rooms[room_code].remove(user_id)
        if user_id in self.match_found:
            del self.match_found[user_id]

private_manager = PrivateManager()
