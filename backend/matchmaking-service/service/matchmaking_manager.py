import uuid
import logging

logger = logging.getLogger(__name__)
class MatchmakingManager:

    def __init__(self):
        self.waiting_players = []
        self.match_found = {}

    def join_queue(self, user_id):
        logger.info(f"📥 join_queue called by {user_id}")
        if user_id in self.match_found:
            return self.match_found[user_id]

        if user_id not in self.waiting_players:
            self.waiting_players.append(user_id)

        if len(self.waiting_players) >= 2:
            p1 = self.waiting_players.pop(0)
            p2 = self.waiting_players.pop(0)
            game_id = f"matchmaking_{uuid.uuid4()}"

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
            result = self.match_found[user_id]
            logger.info(f"🎯 p1={p1}, p2={p2}, user_id={user_id}, returning side=...")
            logger.info(f"🔎 match_info retourné pour user={user_id} = {result}")

            return self.match_found[user_id] 
        else:
            return None

    def remove_from_queue(self, user_id):
        if user_id in self.waiting_players:
            self.waiting_players.remove(user_id)
        if user_id in self.match_found:
            del self.match_found[user_id]

matchmaking_manager = MatchmakingManager()
