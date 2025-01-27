import uuid
from .game_manager import game_manager

class MatchmakingManager:
    def __init__(self):
        self.waiting_players = []
        # match_found : { user_id: { "game_id": str, "players": [p1, p2], "side": "left"/"right" } }
        self.match_found = {}

    def join_queue(self, user_id):
        # Déjà matché ?
        if user_id in self.match_found:
            return {
                "game_id": self.match_found[user_id]["game_id"],
                "players": self.match_found[user_id]["players"],
                "side": self.match_found[user_id]["side"]
            }

        # Ajouter le joueur à la file si pas déjà dedans
        if user_id in self.waiting_players:
            return None
        self.waiting_players.append(user_id)

        # Si on a 2 joueurs => créer un match
        if len(self.waiting_players) >= 2:
            p1 = self.waiting_players.pop(0)  # 1er joueur
            p2 = self.waiting_players.pop(0)  # 2e joueur
            game_id = f"matchmaking_{uuid.uuid4()}"
            game_manager.get_or_create_game(game_id)

            # Stocker infos de match
            match_info_p1 = {
                "game_id": game_id,
                "players": [p1, p2],
                "side": "left"    # p1 = côté gauche
            }
            match_info_p2 = {
                "game_id": game_id,
                "players": [p1, p2],
                "side": "right"   # p2 = côté droit
            }

            self.match_found[p1] = match_info_p1
            self.match_found[p2] = match_info_p2

            # On renvoie le match seulement pour le joueur qui vient de faire la requête
            # => Il s'agit donc de p2 si c'est lui qui a déclenché la pop(0) pop(0).
            #  Mais en fait, on ne sait pas lequel appelle la méthode en dernier.
            #  On va donc renvoyer match_info_p2 si user_id == p2, sinon match_info_p1.
            if user_id == p1:
                return match_info_p1
            else:
                return match_info_p2
            
    def remove_from_queue(self, user_id):
        """Retirer un joueur de la file d'attente et vérifier s'il appartient à une partie."""
        if user_id in self.waiting_players:
            self.waiting_players.remove(user_id)
            print(f"User {user_id} removed from matchmaking queue.")
        if user_id in self.match_found:
            print(f"User {user_id} was in a game. Cleaning up...")
            del self.match_found[user_id]

matchmaking_manager = MatchmakingManager()
