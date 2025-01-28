import json
from django.http import JsonResponse
from .matchmaking_manager import matchmaking_manager

from .private_manager import private_manager
from .game_manager import game_manager

def join_matchmaking(request, user_id):
    if not user_id:
        return JsonResponse({"error": "User ID not provided"}, status=400)
    if user_id in matchmaking_manager.match_found:
        match_info = matchmaking_manager.match_found[user_id]
        return JsonResponse({
            "status": "matched",
            "game_id": match_info["game_id"],
            "players": match_info["players"],
            "side": match_info["side"],
        })
    result = matchmaking_manager.join_queue(user_id)
    
    if result:
        return JsonResponse({
            "status": "matched",
            "game_id": result["game_id"],
            "players": result["players"],
            "side": result["side"],
        })
    else:
        # Sinon, indiquer que le joueur est en attente
        return JsonResponse({"status": "waiting"})


def leave_matchmaking(request, user_id):
    if not user_id:
        return JsonResponse({"error": "User ID not provided"}, status=400)

    matchmaking_manager.remove_from_queue(user_id)
    return JsonResponse({"status": "removed"})



def join_room(request):
    """
    POST /api/pong-service/join_private_room/
    Body JSON: { "room_code": "ABC123", "user_id": "PlayerA" }
    """
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code or user_id"}, status=400)

    result = private_manager.join_room(room_code, user_id)

    if result:
        # => On a 2 joueurs => matched
        return JsonResponse({
            "status": "matched",
            "game_id": result["game_id"],
            "players": result["players"],
            "side": result["side"],
        })
    else:
        # 1 seul joueur => waiting
        return JsonResponse({"status": "waiting"})

def leave_room(request):
    """
    POST /api/pong-service/leave_private_room/
    Body JSON: { "room_code": "ABC123", "user_id": "PlayerA" }
    """
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code or user_id"}, status=400)

    private_manager.remove_from_room(room_code, user_id)
    return JsonResponse({"status": "removed"})