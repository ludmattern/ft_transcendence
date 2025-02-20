from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random, string
from .models import ManualTournament, ManualTournamentParticipants

@csrf_exempt
def get_current_tournament(request):
    """
    Vue classique qui renvoie le bracket du tournoi courant.
    On suppose que le tournoi courant est le dernier tournoi ayant le status "ongoing".
    """
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)

    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id parameter is required"}, status=400)
    
    try:
        # pour l instant cest le dernier ongoing a cahgner 
        tournament = ManualTournament.objects.filter(
            status="ongoing",
            participants__user__id=user_id
        ).latest("created_at")
    except ManualTournament.DoesNotExist:
        return JsonResponse({"error": "No active tournament found for this user"}, status=404)

    participants = list(
        ManualTournamentParticipants.objects.filter(
            tournament=tournament, status="accepted"
        ).values_list("user__username", flat=True)
    )
    
    n = len(participants)
    if n not in [4, 8, 16]:
        return JsonResponse({"error": f"Unexpected number of participants: {n}"}, status=400)
    
    if n == 4:
        round_names_order = ["Semi-finals", "Final"]
    elif n == 8:
        round_names_order = ["Quarter-finals", "Semi-finals", "Final"]
    elif n == 16:
        round_names_order = ["Round of 16", "Quarter-finals", "Semi-finals", "Final"]
    else:
        round_names_order = [f"Round {i+1}" for i in range(int(math.log2(n)))]

    rounds = []
    
    current_matches = []
    match_id = 1
    for i in range(0, n, 2):
        match = {
            "id": match_id,
            "player1": participants[i],
            "player2": participants[i+1],
            "status": "pending",
            "winner": None,
            "score": None,
        }
        current_matches.append(match)
        match_id += 1

    rounds.append({
        "round": round_names_order[0],
        "matches": current_matches
    })

    prev_matches = current_matches
    for round_index in range(1, len(round_names_order)):
        next_round_matches = []
        match_id = 1
        for j in range(0, len(prev_matches), 2):
            match = {
                "id": match_id,
                "player1": "TBD",
                "player2": "TBD",
                "status": "pending",
                "winner": None,
                "score": None,
            }
            next_round_matches.append(match)
            match_id += 1
        rounds.append({
            "round": round_names_order[round_index],
            "matches": next_round_matches
        })
        prev_matches = next_round_matches

    data = {
        "tournament_id": tournament.id,
        "serial_key": tournament.serial_key,
        "status": tournament.status,
        "participants": participants,
        "rounds": rounds,
    }
    return JsonResponse(data)
