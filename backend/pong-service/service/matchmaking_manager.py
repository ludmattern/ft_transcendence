import uuid
from .game_manager import game_manager

class MatchmakingManager:
    def __init__(self):
        self.waiting_player = None  # Aucun joueur en attente initialement

    def join_queue(self, user_id):
        """ Renvoie un game_id quand 2 joueurs sont trouvés, sinon None. """
        if self.waiting_player is None:
            # Si personne n'attend, définir cet utilisateur comme en attente
            self.waiting_player = user_id
            return None
        elif self.waiting_player == user_id:
            # Si l'utilisateur est déjà en attente, ne pas matcher avec lui-même
            return None
        else:
            # On a trouvé un autre joueur en attente
            game_id = f"matchmaking_{uuid.uuid4()}"  # Générer un game_id unique
            waiting_player = self.waiting_player  # Sauvegarder l'autre joueur
            self.waiting_player = None  # Réinitialiser l'attente

            # Créer la partie dans le GameManager
            game_manager.get_or_create_game(game_id)

            # Retourner le game_id et les deux joueurs
            return game_id

matchmaking_manager = MatchmakingManager()
