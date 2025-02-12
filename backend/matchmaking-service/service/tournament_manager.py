# tournament_manager.py
import uuid

class TournamentManager:
    def __init__(self):
        self.tournaments = {}

    def create_tournament(self, creator_id, name, size, map_choice):
        tournament_id = f"tournament_{uuid.uuid4()}"
        self.tournaments[tournament_id] = {
            "name": name,
            "size": size,
            "map": map_choice,
            "players": [],
            "matches": [],
            "currentMatchIndex": 0,
            "status": "registration",
            "creator_id": creator_id
        }
        return tournament_id

    def register_player(self, tournament_id, user_id, alias):
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}

        tournament = self.tournaments[tournament_id]

        if tournament["status"] != "registration":
            return {"error": "Tournament already started"}

        if len(tournament["players"]) >= tournament["size"]:
            return {"error": "Tournament is full"}

        tournament["players"].append({
            "user_id": user_id,
            "alias": alias,
            "isEliminated": False
        })

        if len(tournament["players"]) == tournament["size"]:
            self.start_tournament(tournament_id)

        return {"success": True, "status": tournament["status"]}

    def start_tournament(self, tournament_id):
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}
        
        t = self.tournaments[tournament_id]
        
        if t["status"] != "registration":
            return {"error": "Tournament already started"}

        if len(t["players"]) < 2:
            return {"error": "Not enough players"}

        t["status"] = "in_progress"

        players = t["players"]
        match_list = []

        for i in range(0, len(players), 2):
            if i + 1 < len(players):
                match_list.append([players[i], players[i+1]])

        t["matches"] = match_list
        t["currentMatchIndex"] = 0

        return {"success": True, "matches": match_list}

    def get_current_match(self, tournament_id):
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}

        t = self.tournaments[tournament_id]

        if t["status"] != "in_progress":
            return {"error": "Tournament not started"}

        idx = t["currentMatchIndex"]
        if idx >= len(t["matches"]):
            return {"error": "No more matches, tournament ended"}

        return {"match": t["matches"][idx]}

    def record_match_result(self, tournament_id, winner_user_id):
        if tournament_id not in self.tournaments:
            return {"error": "Tournament not found"}

        t = self.tournaments[tournament_id]

        if t["status"] != "in_progress":
            return {"error": "Tournament not started"}

        idx = t["currentMatchIndex"]
        if idx >= len(t["matches"]):
            return {"error": "No matches left"}

        match = t["matches"][idx]

        loser = match[1] if match[0]["user_id"] == winner_user_id else match[0]
        loser["isEliminated"] = True

        t["currentMatchIndex"] += 1

        if t["currentMatchIndex"] >= len(t["matches"]):
            t["status"] = "finished"
            return {"info": "Tournament ended"}

        return {"info": "Next match ready"}

tournament_manager = TournamentManager()
