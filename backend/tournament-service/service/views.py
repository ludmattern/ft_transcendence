from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random, string
from .models import ManualTournament, ManualTournamentParticipants, TournamentMatch, ManualUser
import logging
import json
from cryptography.fernet import Fernet
from django.conf import settings
from django.db.models import Q
from django.db import models

logger = logging.getLogger(__name__)
cipher = Fernet(settings.FERNET_KEY)

def getTournamentParticipants(request, tournament_id):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)

	if not tournament_id:
		return JsonResponse({"error": "tournament_id parameter is required"}, status=400)

	try:
		tournament = ManualTournament.objects.get(id=tournament_id)
	except ManualTournament.DoesNotExist:
		return JsonResponse({"error": "Tournament not found"}, status=404)

	participants = ManualTournamentParticipants.objects.filter(
		tournament=tournament
	).filter(
		status__in=["accepted", "pending"]
	)

	data = {
		"tournament_id": tournament.id,
		"tournament_name": tournament.name,
		"participants": [
			{
				"id": participant.user.id,
				"username": participant.user.username,
				"status": participant.status
			}
			for participant in participants
		]
	}

	return JsonResponse(data)

#TODO ici pas de changement avec le online 

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
	
	size = {}
	for match in matches:
		size.setdefault(match.round_number, []).append({
			"id": match.id,
			"player1": match.player1 or "TBD",
			"player2": match.player2 or "TBD",
			"status": match.status,
			"winner": match.winner,
			"score": match.score,
			"match_key": match.match_key,
		})
	
	size_list = []
	for round_num in sorted(size.keys()):
		size_list.append({
			"round": f"Round {round_num}",
			"matches": size[round_num]
		})

	data = {
		"tournament_id": tournament.id,
		"serial_key": tournament.serial_key,
		"status": tournament.status,
		"participants": list(tournament.participants.all().values_list("user__username", flat=True)),
		"size": size_list,
		"mode": tournament.mode
	}
	
	return JsonResponse(data)

def getTournamentSerialKey(request, user_id):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)
	if not user_id:
		return JsonResponse({"error": "user_id parameter is required"}, status=400)
	
	try:
		tournament = ManualTournament.objects.filter(
			status="upcoming" or "ongoing",
			participants__user__id=user_id
		).latest("created_at")
		serial_key = tournament.serial_key
	except ManualTournament.DoesNotExist:
		serial_key = ""

	data = {"serial_key": serial_key}
	return JsonResponse(data)

def getParticipantStatusInTournament(request, user_id):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)
	if not user_id:
		return JsonResponse({"error": "user_id parameter is required"}, status=400)
	
	try:
		participant = ManualTournamentParticipants.objects.filter(
			user__id=user_id,
			status="accepted" or "pending"
		).latest("created_at")
		status = participant.status
	except ManualTournamentParticipants.DoesNotExist:
		status = "none"
	data = {"status": status}
	return JsonResponse(data)

def getTournamentIdFromSerialKey(request, serial_key):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)
	if not serial_key:
		return JsonResponse({"error": "serial_key parameter is required"}, status=400)
	
	try:
		tournament = ManualTournament.objects.get(serial_key=serial_key)
	except ManualTournament.DoesNotExist:
		return JsonResponse({"error": "Tournament not found"}, status=404)

	data = {"tournament_id": tournament.id}
	return JsonResponse(data)

def isUserTournamentOrganizer(request, user_id, tournament_serial_key):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)
	if not user_id or not tournament_serial_key:
		return JsonResponse({"error": "user_id and tournament_serial_key parameters are required"}, status=400)
	
	try:
		tournament = ManualTournament.objects.get(serial_key=tournament_serial_key)
	except ManualTournament.DoesNotExist:
		return JsonResponse({"error": "Tournament not found"}, status=404)

	data = {"is_organizer": str(tournament.organizer_id) == user_id}
	return JsonResponse(data)

def getStatusOfCurrentTournament(request, user_id):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)
	if not user_id:
		return JsonResponse({"error": "user_id parameter is required"}, status=400)
	
	try:
		tournament = ManualTournament.objects.filter(
			participants__user__id=user_id
		).latest("created_at")
	except ManualTournament.DoesNotExist:
		data = {"status": "none"}
		return JsonResponse(data)

	data =	{
				"status": tournament.status,
				"mode": tournament.mode,
			}

	return JsonResponse(data)

def getCurrentTournamentInformation(request, user_id):
	if request.method != "GET":
		return JsonResponse({"error": "GET method required"}, status=405)

	try:
		user = ManualUser.objects.get(id=user_id)
	except ManualUser.DoesNotExist:
		return JsonResponse({"error": "User not found"}, status=404)

	if user.current_tournament_id == 0:
		return JsonResponse({
			"tournament": None,
			"message": "User is not participating in any tournament.",
			"user_id": user.id,
		})

	try:
		tournament = ManualTournament.objects.get(id=user.current_tournament_id)
	except ManualTournament.DoesNotExist:
		return JsonResponse({
				"tournament": None,
				"message": "Tournament not found.",
				"user_id": user.id,
		})

	participants_qs = ManualTournamentParticipants.objects.filter(tournament=tournament).exclude(status="rejected").select_related("user")
	participants_list = [
		{"id": participant.user.id,
		"username": participant.user.username,
		"status": participant.status} 
		for participant in participants_qs
	]

	data = {
		"user_id": user.id,
		"tournament_id": tournament.id,
		"serial_key": tournament.serial_key,
		"size": tournament.size,
		"status": tournament.status,
		"organizer_id": tournament.organizer.id,
		"participants": participants_list,
		"participants_count": len(participants_list),
		"mode": tournament.mode
	}
	return JsonResponse(data)


#TODO ici logiquement les modifs seront au niveau du pong et ou matchamking 
# ou il faudrat ajouter le tournament id dans la requete sinon pas de modif majeur

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
		score1 = final_scores.get(payload_player1, 0)
		score2 = final_scores.get(payload_player2, 0)

		match.score = f"{score1}-{score2}"		
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
			
		return JsonResponse({"success": True, "message": "Match updated"})
	except Exception as e:
		logger.exception("Error updating match result:")
		return JsonResponse({"error": str(e)}, status=500)



#TODO ici celle-ci fonctionne que pour le local 

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
		
		organizer.tournament_status = "out"
		organizer.current_tournament_id = 0
		organizer.save()
		tournament.delete()
		
		logger.info(f"Tournoi {tournament_id} abandonné. L'organisateur {organizer.id} a été réinitialisé.")
		return JsonResponse({"success": True, "message": "Tournament abandoned and organizer updated"})
	except ManualTournament.DoesNotExist:
		return JsonResponse({"error": "Tournament not found"}, status=404)
	except Exception as e:
		logger.exception("Error abandoning tournament:")
		return JsonResponse({"error": str(e)}, status=500)



def encrypt_thing(args):
	"""Encrypts the args."""
	return cipher.encrypt(args.encode('utf-8')).decode('utf-8')

@csrf_exempt
def create_local_tournament_view(request):
	if request.method != "POST":
		return JsonResponse({"error": "POST method required"}, status=405)
	try:
		body = json.loads(request.body.decode("utf-8"))
		organizer_id = body.get("organizer_id")
		players = body.get("players", [])

		if not organizer_id:
			logger.error("Organizer ID is missing in the request data.")
			return JsonResponse({"error": "Organizer ID is required"}, status=400)
		if len(players) not in [4, 8, 16]:
			logger.error(f"Invalid tournament size: {len(players)} players provided. Expected 4, 8 ou 16.")
			return JsonResponse({"error": "Invalid tournament size"}, status=400)

		try:
			organizer = ManualUser.objects.get(id=organizer_id)
			if organizer.tournament_status != "out":
				error_msg = f"L'utilisateur {organizer.id} est déjà dans un tournoi actif."
				logger.warning(error_msg)
				return JsonResponse({"error": error_msg}, status=400)
		except ManualUser.DoesNotExist:
			return JsonResponse({"error": "Organizer not found"}, status=404)

		serial_key = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
		logger.info(f"🔑 Génération de serial_key: {serial_key}")

		tournament = ManualTournament.objects.create(
			serial_key=serial_key,
			name="Local Tournament",
			organizer_id=organizer_id,
			size=len(players) // 2,
			status="ongoing",
			mode="local"
		)

		logger.info(f"🏆 Tournament créé: ID={tournament.id}, serial_key={serial_key}, organizer_id={organizer_id}")

		for username in players:
			user, created = ManualUser.objects.get_or_create(
				username=username,
				defaults={
					"email": encrypt_thing(f"{username.lower()}@local.fake"),
					"password": "fakepassword",
					"is_dummy": True
				}
			)
			if created:
				logger.info(f"👤 Utilisateur créé: username={user.username}")
			else:
				logger.info(f"👤 Utilisateur récupéré: username={user.username}")
			user.tournament_status = "participating"
			user.current_tournament_id = tournament.id
			user.save()
			ManualTournamentParticipants.objects.create(
				tournament=tournament,
				user=user,
				status="accepted"
			)
			logger.info(f"✅ Participant ajouté: TournamentID={tournament.id}, User={user.username}, status=accepted")

		n = len(players)
		size_count = int(math.log2(n))
		for i in range(0, n, 2):
			match_order = (i // 2) + 1
			player1 = players[i]
			player2 = players[i+1]
			TournamentMatch.objects.create(
				tournament=tournament,
				round_number=1,
				match_order=match_order,
				player1=player1,
				player2=player2,
				status="pending"
			)
			logger.info(f"🏅 Round 1, Match {match_order} créé: {player1} vs {player2}")

		previous_matches = n // 2
		for round_number in range(2, size_count + 1):
			num_matches = previous_matches // 2
			for match_order in range(1, num_matches + 1):
				TournamentMatch.objects.create(
					tournament=tournament,
					round_number=round_number,
					match_order=match_order,
					player1="TBD",
					player2="TBD",
					status="pending"
				)
				logger.info(f"🏅 Round {round_number}, Match {match_order} créé: TBD vs TBD")
			previous_matches = num_matches

		response_data = {
			"success": True,
			"serial_key": serial_key,
			"tournament_id": tournament.id,
			"players": players
		}
		return JsonResponse(response_data, status=200)

	except Exception as e:
		logger.exception("Error creating local tournament:")
		return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def abandon_online_tournament(request):
	if request.method != "POST":
		return JsonResponse({"error": "POST method required"}, status=405)
    
	try:
		body = json.loads(request.body.decode("utf-8"))

		user_id = body.get("user_id")
		if not user_id:
			return JsonResponse({"error": "user_id is required"}, status=400)

		user = ManualUser.objects.get(id=user_id)

		tournament_id = user.current_tournament_id
		if tournament_id == 0:
			return JsonResponse({"error": "User is not participating in any tournament"}, status=400)

		participant = ManualTournamentParticipants.objects.filter(
            tournament_id=tournament_id, user=user).first()

		if not participant:
			return JsonResponse({"error": "User not found in tournament"}, status=404)

		participant.status = "left"
		participant.save()

		match = TournamentMatch.objects.filter(
			tournament_id=tournament_id,
			status="pending"
        ).filter(models.Q(player1=user.username) | models.Q(player2=user.username)).first()

		if match:
			opponent = match.player1 if match.player2 == user.username else match.player2
			if opponent:
				match.winner = opponent
				match.score = "Forfait"
				match.status = "completed"
				match.save()

				next_round = match.round_number + 1
				next_match_order = (match.match_order + 1) // 2
				next_match = TournamentMatch.objects.filter(
					tournament_id=tournament_id,
					round_number=next_round,
					match_order=next_match_order
				).first()

				if next_match:
					if match.match_order % 2 == 1:
						next_match.player1 = opponent
					else:
						next_match.player2 = opponent
					next_match.save()
     	
		user.tournament_status = "out"
		user.current_tournament_id = 0
		user.save()

		return JsonResponse({"success": True, "message": "User removed from tournament and match forfeited"})

	except ManualUser.DoesNotExist:
		return JsonResponse({"error": "User not found"}, status=404)
	except ManualTournament.DoesNotExist:
		return JsonResponse({"error": "Tournament not found"}, status=404)
	except Exception as e:
		logger.exception("Error handling online tournament abandonment:")
		return JsonResponse({"error": str(e)}, status=500)



#TODO Here we can find logic on how we try to join tournamnet from TournamentContent.js. One with trying to random tournament with a specific size
# and the other one with trying to join a tournament with a room code (serial_key)

@csrf_exempt
def try_join_random_tournament(request):
	if request.method != "POST":
		return JsonResponse({"message": "POST method required"}, status=405)
	try:
		body = json.loads(request.body.decode("utf-8"))
		logger.info(f"Body: {body}")
		userId = body.get("userId")
		if not userId:
			return JsonResponse({"message": "userId is required"}, status=400)
		user = ManualUser.objects.get(id=userId)
		if user.tournament_status != "out":
			return JsonResponse({"message": "User is already in a tournament"}, status=400)
		
		tournamentSize = body.get("tournamentSize")
		
		tournament = ManualTournament.objects.filter(
			status="upcoming",
			mode="online",
			size=tournamentSize
		).order_by("created_at").first()
		if not tournament:
			return JsonResponse({"error": "No upcoming tournament found"}, status=404)		

		participant_count = ManualTournamentParticipants.objects.filter(tournament=tournament).filter(status="accepted" or "pending").count()
		if str(participant_count) >= tournamentSize:
			return JsonResponse({"message": "Tournament is full"}, status=400)
		
		participant = ManualTournamentParticipants.objects.create(
			tournament=tournament,
			user=user,
			status="pending"
		)
		
		logger.info(f"User {userId} Found {tournament.id} tournament to join")
		return JsonResponse({"success": True, "message": "User Found a random tournament", "payload": {"userId":userId, "tournament_id": tournament.id}})
	except ManualUser.DoesNotExist:
		return JsonResponse({"message": "User not found"}, status=404)
	except Exception as e:
		logger.exception("Error joining random tournament:")
		return JsonResponse({"message": str(e)}, status=500)

@csrf_exempt
def try_join_tournament_with_room_code(request):
	if request.method != "POST":
		return JsonResponse({"message": "POST method required"}, status=405)
	try:
		body = json.loads(request.body.decode("utf-8"))
		logger.info(f"Body: {body}")
		userId = body.get("userId")
		roomCode = body.get("roomCode")
		if not userId or not roomCode:
			return JsonResponse({"message": "userId and roomCode are required"}, status=400)
		user = ManualUser.objects.get(id=userId)
		if user.tournament_status != "out":
			return JsonResponse({"message": "User is already in a tournament"}, status=400)
		tournament = ManualTournament.objects.filter(
			status="upcoming",
			mode="online",
			serial_key=roomCode
		).first()
		if not tournament:
			return JsonResponse({"message": "No upcoming tournament found"}, status=404)		

		participant_count = ManualTournamentParticipants.objects.filter(tournament=tournament).filter(status="accepted" or "pending").count()
		if participant_count >= tournament.size:
			return JsonResponse({"message": "Tournament is full"}, status=400)
		
		participant = ManualTournamentParticipants.objects.create(
			tournament=tournament,
			user=user,
			status="pending"
		)
		
		logger.info(f"User {userId} Found {tournament.id} tournament to join")
		return JsonResponse({"success": True, "message": "User Found a random tournament", "payload": {"userId":userId, "tournament_id": tournament.id}})
	
	except ManualUser.DoesNotExist:
		return JsonResponse({"message": "User not found"}, status=404)
	except Exception as e:
		logger.exception("Error joining tournament with room code:")
		return JsonResponse({"message": str(e)}, status=500)
