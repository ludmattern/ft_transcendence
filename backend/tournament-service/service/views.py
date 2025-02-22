from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random, string
from .models import ManualTournament, ManualTournamentParticipants, TournamentMatch
import logging
import json

logger = logging.getLogger(__name__)
def get_current_tournament(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id parameter is required"}, status=400)
    try:
        tournament = ManualTournament.objects.filter(
            status="ongoing",
            participants__user__id=user_id
        ).latest("created_at")
    except ManualTournament.DoesNotExist:
        return JsonResponse({"error": "No active tournament found for this user"}, status=404)

    matches = TournamentMatch.objects.filter(tournament=tournament).order_by("round_number", "match_order")
    
    rounds = {}
    for match in matches:
        rounds.setdefault(match.round_number, []).append({
            "id": match.id,
            "player1": match.player1 or "TBD",
            "player2": match.player2 or "TBD",
            "status": match.status,
            "winner": match.winner,
            "score": match.score,
        })
    
    rounds_list = []
    for round_num in sorted(rounds.keys()):
        rounds_list.append({
            "round": f"Round {round_num}",
            "matches": rounds[round_num]
        })

    data = {
        "tournament_id": tournament.id,
        "serial_key": tournament.serial_key,
        "status": tournament.status,
        "participants": list(tournament.participants.all().values_list("user__username", flat=True)),
        "rounds": rounds_list,
        "mode": tournament.mode
    }
    return JsonResponse(data)


@csrf_exempt
def update_match_result(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)
    try:
        body = json.loads(request.body.decode("utf-8"))
        tournament_id = body.get("tournament_id")
        winner_id = body.get("winner_id")
        loser_id = body.get("loser_id")
        final_scores = body.get("final_scores")
        payload_player1 = body.get("player1")
        payload_player2 = body.get("player2")
        
        if not (tournament_id and winner_id and loser_id and final_scores and payload_player1 and payload_player2):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        match = TournamentMatch.objects.filter(
            tournament_id=tournament_id,
            player1=payload_player1,
            player2=payload_player2,
            status="pending"
        ).order_by("round_number").first()
        
        if not match:
            return JsonResponse({"error": "Match not found"}, status=404)
        
        match.winner = winner_id
        match.score = f"{final_scores.get(winner_id)}-{final_scores.get(loser_id)}"
        match.status = "completed"
        match.save()
        
        logger.info(f"Match updated for tournament {tournament_id}: {payload_player1} vs {payload_player2} - winner: {winner_id}, score: {match.score}")
        
        current_round = match.round_number
        current_match_order = match.match_order
        
        next_match_order = (current_match_order + 1) // 2
        next_round = current_round + 1

        try:
            next_match = TournamentMatch.objects.get(
                tournament_id=tournament_id,
                round_number=next_round,
                match_order=next_match_order
            )
            if current_match_order % 2 == 1:
                next_match.player1 = winner_id
            else:
                next_match.player2 = winner_id
            next_match.save()
            logger.info(f"Prochain match (round {next_round}, match {next_match_order}) mis à jour avec le gagnant {winner_id}")
        except TournamentMatch.DoesNotExist:
            logger.info("Final match reached: no next match found, finishing tournament.")
            tournament = ManualTournament.objects.get(id=tournament_id)
            tournament.status = "completed"
            tournament.save()
            organizer = tournament.organizer
            organizer.in_tournament = False
            organizer.save()
           # TournamentMatch.objects.filter(tournament=tournament).delete()        
            
        return JsonResponse({"success": True, "message": "Match updated"})
    except Exception as e:
        logger.exception("Error updating match result:")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def abandon_local_tournament(request):
   
    
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)
    try:
        body = json.loads(request.body.decode("utf-8"))
        tournament_id = body.get("tournament_id")
        if not tournament_id:
            return JsonResponse({"error": "tournament_id is required"}, status=400)
        tournament = ManualTournament.objects.get(id=tournament_id)
        organizer = tournament.organizer
        
        organizer.in_tournament = False
        organizer.save()
        tournament.delete()
        
        logger.info(f"Tournoi {tournament_id} abandonné. L'organisateur {organizer.id} a été réinitialisé.")
        return JsonResponse({"success": True, "message": "Tournament abandoned and organizer updated"})
    except ManualTournament.DoesNotExist:
        return JsonResponse({"error": "Tournament not found"}, status=404)
    except Exception as e:
        logger.exception("Error abandoning tournament:")
        return JsonResponse({"error": str(e)}, status=500)
