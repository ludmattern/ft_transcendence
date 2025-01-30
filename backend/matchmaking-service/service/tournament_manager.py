# tournament_manager.py
import uuid

class TournamentManager:
    def __init__(self):
        # Dictionnaire : tournament_id -> informations du tournoi
        self.tournaments = {}

    def create_tournament(self, creator_id, name, size, map_choice):
        """
        Crée un nouveau tournoi, avec un ID unique.
        `creator_id` : l’utilisateur qui crée le tournoi
        `name` : nom du tournoi
        `size` : 4, 8, 16...
        `map_choice` : map sélectionnée
        """
        tournament_id = f"tournament_{uuid.uuid4()}"
        self.tournaments[tournament_id] = {
            "name": name,
            "size": size,
            "map": map_choice,
            "players": [],  # liste de { "user_id":..., "alias":..., "isEliminated": False, ... }
            "matches": [],  # liste de matches planifiés
            "currentMatchIndex": 0,
            "status": "registration",  # registration / in_progress / finished
            "creator_id": creator_id
        }
        return tournament_id

    def register_player(self, tournament_id, user_id, alias):
        """
        Inscription d’un joueur dans un tournoi. On stocke l’alias.
        """
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}
        tournament = self.tournaments[tournament_id]
        if len(tournament["players"]) >= tournament["size"]:
            return {"error": "Tournament is full"}
        tournament["players"].append({
            "user_id": user_id,
            "alias": alias,
            "isEliminated": False
        })
        return {"success": True}

    def start_tournament(self, tournament_id):
        """
        Quand on est prêt (assez de joueurs ou le créateur clique "start"),
        on génère la liste des matches.
        """
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}
        t = self.tournaments[tournament_id]
        if len(t["players"]) < 2:
            return {"error": "Not enough players"}
        t["status"] = "in_progress"
        # Générer le bracket (ex. pairer [p1,p2], [p3,p4], etc.)
        # Pour simplifier, on fait un bracket direct.
        # On peut stocker la queue de matches dans t["matches"]
        players = t["players"]
        # ex. pairwise
        match_list = []
        for i in range(0, len(players), 2):
            if i+1 < len(players):
                match_list.append([players[i], players[i+1]])
        t["matches"] = match_list
        t["currentMatchIndex"] = 0
        return {"success": True, "matches": match_list}

    def get_current_match(self, tournament_id):
        """
        Retourne le match en cours + participants
        """
        t = self.tournaments[tournament_id]
        if t["status"] != "in_progress":
            return {"error": "Tournament not in progress"}
        idx = t["currentMatchIndex"]
        if idx >= len(t["matches"]):
            return {"error": "No more matches, tournament ended"}
        return {"match": t["matches"][idx]}

    def record_match_result(self, tournament_id, winner_user_id):
        """
        Le service Pong ou le front renvoie le vainqueur => on avance l’index
        """
        t = self.tournaments[tournament_id]
        idx = t["currentMatchIndex"]
        # Mark loser as eliminated
        match = t["matches"][idx]
        # ex. 2 joueurs => match[0], match[1]
        loser = None
        if match[0]["user_id"] == winner_user_id:
            loser = match[1]
        else:
            loser = match[0]
        loser["isEliminated"] = True

        t["currentMatchIndex"] += 1
        # S’il reste des joueurs non éliminés, on peut re-générer un nouveau match, etc.
        # Pour un bracket complet, on ferait un code plus complexe...

        if t["currentMatchIndex"] >= len(t["matches"]):
            t["status"] = "finished"
            return {"info": "Tournament ended"}
        return {"info": "Next match ready"}

tournament_manager = TournamentManager()
