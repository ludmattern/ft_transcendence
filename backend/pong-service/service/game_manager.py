# service/game_manager.py
from .games import BasePongGame

class GameManager:
    def __init__(self):
        self.games = {}

    def get_or_create_game(self, game_id, player1_id=None, player2_id=None):
        """Récupère une partie existante ou en crée une nouvelle avec les IDs des joueurs."""
        if game_id not in self.games:
            self.games[game_id] = BasePongGame(game_id, player1_id, player2_id)
        else:
            game = self.games[game_id]
            if game.player1_id is None and player1_id is not None:
                game.player1_id = player1_id
            if game.player2_id is None and player2_id is not None:
                game.player2_id = player2_id
        return self.games[game_id]

    def get_game(self, game_id):
        return self.games.get(game_id)

    def cleanup_game(self, game_id):
        if game_id in self.games:
            del self.games[game_id]


game_manager = GameManager()
