import json
from django.http import JsonResponse
from .matchmaking_manager import matchmaking_manager
from .private_manager import private_manager
from .tournament_manager import tournament_manager

def join_matchmaking(request, user_id):
    if not user_id:
        return JsonResponse({"error": "No user_id provided"}, status=400)
    result = matchmaking_manager.join_queue(user_id)
    if result:
        return JsonResponse({"status": "matched", **result})
    return JsonResponse({"status": "waiting"})

def leave_matchmaking(request, user_id):
    matchmaking_manager.remove_from_queue(user_id)
    return JsonResponse({"status": "removed"})

def join_room(request):
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code/user_id"}, status=400)

    result = private_manager.join_room(room_code, user_id)
    if result:
        return JsonResponse({"status": "matched", **result})
    return JsonResponse({"status": "waiting"})

def leave_room(request):
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code/user_id"}, status=400)

    private_manager.remove_from_room(room_code, user_id)
    return JsonResponse({"status": "removed"})


def create_tournament(request):
    data = json.loads(request.body)
    user_id = data["user_id"]
    name = data["name"]
    size = data["size"]
    map_choice = data["map"]
    t_id = tournament_manager.create_tournament(user_id, name, size, map_choice)
    return JsonResponse({"tournament_id": t_id})

def register_player(request):
    data = json.loads(request.body)
    tournament_id = data["tournament_id"]
    user_id = data["user_id"]
    alias = data["alias"]
    res = tournament_manager.register_player(tournament_id, user_id, alias)
    return JsonResponse(res)

def start_tournament(request):
    data = json.loads(request.body)
    tournament_id = data["tournament_id"]
    res = tournament_manager.start_tournament(tournament_id)
    return JsonResponse(res)

def get_current_match(request):
    data = json.loads(request.body)
    t_id = data["tournament_id"]
    match = tournament_manager.get_current_match(t_id)
    return JsonResponse(match)

def record_match_result(request):
    data = json.loads(request.body)
    t_id = data["tournament_id"]
    winner_id = data["winner_id"]
    res = tournament_manager.record_match_result(t_id, winner_id)
    return JsonResponse(res)
def list_tournaments(request):
    """
    GET /api/tournament/list_tournaments/
    Renvoie la liste des tournois existants
    """
    # Suppose que tu stockes les tournois dans tournament_manager.tournaments
    # sous la forme { "tournament_id": { "name": "...", ... }, ... }
    data = []
    for t_id, info in tournament_manager.tournaments.items():
        data.append({
            "tournament_id": t_id,
            "name": info["name"],       # ou un champ "alias"
            "size": info["size"],       # etc.
            "status": info["status"],   # registration / in_progress / finished
        })
    return JsonResponse(data, safe=False)