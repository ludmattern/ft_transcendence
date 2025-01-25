from django.http import JsonResponse
from django.shortcuts import render
from .matchmaking_manager import matchmaking_manager

def home(request):
    return render(request, 'home.html')  # Optionnel

def join_matchmaking(request):
    """ Endpoint: /matchmaking/?user_id=... """
    user_id = request.GET.get('user_id', 'UnknownUser')
    game_id = matchmaking_manager.join_queue(user_id)
    if game_id:
        return JsonResponse({"status": "matched", "game_id": game_id})
    else:
        return JsonResponse({"status": "waiting"})
