# service/game_manager.py
from .games import BasePongGame

class GameManager:
    def __init__(self):
        self.games = {}  # Dictionnaire pour stocker les parties {game_id: BasePongGame}

    def get_or_create_game(self, game_id):
        if game_id not in self.games:
            self.games[game_id] = BasePongGame(game_id)
        return self.games[game_id]

    def get_game(self, game_id):
        return self.games.get(game_id)

    def cleanup_game(self, game_id):
        if game_id in self.games:
            del self.games[game_id]

game_manager = GameManager()
