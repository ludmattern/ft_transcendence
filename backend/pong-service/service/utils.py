from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from service.models import ManualUser




def calculate_elo(winner_elo, loser_elo, k_factor=32):
    """
    Met à jour les scores Elo après un match.
    
    winner_elo : Elo du gagnant avant le match
    loser_elo : Elo du perdant avant le match
    k_factor : Facteur d'ajustement (classique : 32, plus élevé pour un ajustement rapide)
    
    Retourne : (nouveau Elo du gagnant, nouveau Elo du perdant)
    """

    # Probabilités de victoire basées sur l’Elo actuel
    expected_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_elo - loser_elo) / 400))

    # Mise à jour des scores Elo
    new_winner_elo = round(winner_elo + k_factor * (1 - expected_winner))
    new_loser_elo = round(loser_elo + k_factor * (0 - expected_loser))

    return new_winner_elo, new_loser_elo



@csrf_exempt
def update_elo(request):
    """
    Vue appelée après un match pour mettre à jour le Elo des joueurs.
    Reçoit : {"winner_id": "1", "loser_id": "2"}
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        winner_id = data.get("winner_id")
        loser_id = data.get("loser_id")

        if not winner_id or not loser_id:
            return JsonResponse({"error": "Both winner_id and loser_id are required"}, status=400)

        # Récupération des joueurs
        winner = ManualUser.objects.get(id=winner_id)
        loser = ManualUser.objects.get(id=loser_id)

        # Calcul du nouvel Elo
        new_winner_elo, new_loser_elo = calculate_elo(winner.elo, loser.elo)

        # Mise à jour des joueurs
        winner.elo = new_winner_elo
        loser.elo = new_loser_elo
        winner.save()
        loser.save()

        return JsonResponse({
            "success": True,
            "winner_elo": new_winner_elo,
            "loser_elo": new_loser_elo
        })

    except ManualUser.DoesNotExist:
        return JsonResponse({"error": "One or both users not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
