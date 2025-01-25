import uuid
from .game_manager import game_manager

class MatchmakingManager:
    def __init__(self):
        self.waiting_player = None  # ou None si personne

    def join_queue(self, user_id):
        """ Renvoie un game_id quand 2 joueurs sont trouvés, sinon None. """
        if self.waiting_player is None:
            self.waiting_player = user_id
            return None
        else:
            # On a déjà quelqu'un qui attend
            game_id = f"matchmaking_{uuid.uuid4()}"
            self.waiting_player = None

            # On peut créer la partie maintenant ou plus tard dans le consumer
            game_manager.get_or_create_game(game_id)

            return game_id

matchmaking_manager = MatchmakingManager()
