from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from service.models import ManualUser




def calculate_elo(winner_elo, loser_elo, k_factor=32):

    
    expected_winner = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_elo - loser_elo) / 400))

    new_winner_elo = round(winner_elo + k_factor * (1 - expected_winner))
    new_loser_elo = round(loser_elo + k_factor * (0 - expected_loser))

    return new_winner_elo, new_loser_elo
