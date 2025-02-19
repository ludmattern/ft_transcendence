# myapp/views.py
import json
import secrets
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from .models import Tournament, TournamentParticipant

User = get_user_model()

def create_local_tournament(request):
    """ Crée un tournoi local (pas besoin d'utiliser DRF). """
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    try:
        data = json.loads(request.body.decode('utf-8'))  # on parse la requête JSON
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Récupérer les infos
    tournament_name = data.get('name', 'Local Tournament')
    organizer_id = data.get('organizer_id')
    players = data.get('players', [])

    if not organizer_id:
        return JsonResponse({'error': 'Missing organizer_id'}, status=400)

    # Vérifier que l'organisateur existe
    try:
        organizer = User.objects.get(pk=organizer_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Organizer not found'}, status=404)

    # Générer un serial_key unique
    serial_key = secrets.token_urlsafe(8)

    # Créer le tournoi
    tournament = Tournament.objects.create(
        serial_key=serial_key,
        name=tournament_name,
        organizer=organizer,
        status='upcoming'
    )

    # Créer les participants
    for player_name in players:
        TournamentParticipant.objects.create(
            tournament=tournament,
            name=player_name
        )
    
    # On "sérialise" manuellement les données qu'on veut renvoyer
    participants_data = [
        {
            'id': p.id,
            'name': p.name
            # si vous voulez renvoyer plus de champs, vous pouvez !
        }
        for p in tournament.participants.all()
    ]

    response_data = {
        'id': tournament.id,
        'serial_key': tournament.serial_key,
        'name': tournament.name,
        'organizer_id': tournament.organizer_id,
        'status': tournament.status,
        'created_at': tournament.created_at.isoformat(),
        'updated_at': tournament.updated_at.isoformat(),
        'participants': participants_data
    }

    return JsonResponse(response_data, status=201)
