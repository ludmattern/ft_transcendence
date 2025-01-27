from django.http import JsonResponse
from .matchmaking_manager import matchmaking_manager

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

