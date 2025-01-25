from django.http import JsonResponse
from django.shortcuts import render
from .matchmaking_manager import matchmaking_manager


def join_matchmaking(request, user_id):
    if not user_id:
        return JsonResponse({"error": "User ID not provided"}, status=400)
    game_id = matchmaking_manager.join_queue(user_id)
    if game_id:
        return JsonResponse({"status": "matched", "game_id": game_id})
    else:
        return JsonResponse({"status": "waiting"})
