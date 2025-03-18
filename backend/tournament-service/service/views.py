from django.http import JsonResponse  # type: ignore


import math
import random
import string
from .models import (
    ManualTournament,
    ManualTournamentParticipants,
    TournamentMatch,
    ManualUser,
)
import logging
import json
from cryptography.fernet import Fernet  # type: ignore
from django.conf import settings  # type: ignore
import jwt # type: ignore
from functools import wraps
import datetime
from django.views.decorators.http import require_POST, require_GET # type: ignore


logger = logging.getLogger(__name__)
cipher = Fernet(settings.FERNET_KEY)


def jwt_required(view_func):
    """Decorator to check for a valid JWT token in the request."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.COOKIES.get("access_token")
        if not token:
            return JsonResponse({"success": False, "message": "No access_token cookie"}, status=401)

        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                return JsonResponse({"success": False, "message": "Invalid token: no sub"}, status=401)

            try:
                user = ManualUser.objects.get(pk=user_id)
            except ManualUser.DoesNotExist:
                return JsonResponse({"success": False, "message": "User not found"}, status=404)

            if user.session_token != token:
                return JsonResponse(
                    {"success": False, "message": "Invalid or outdated token"},
                    status=401,
                )

            now = datetime.datetime.utcnow()
            if user.token_expiry is None or user.token_expiry < now:
                return JsonResponse({"success": False, "message": "Token expired in DB"}, status=401)

            request.user = user

        except jwt.ExpiredSignatureError:
            return JsonResponse({"success": False, "message": "Token expired"}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({"success": False, "message": "Internal server error"}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper




@require_GET
@jwt_required
def get_current_tournament(request):
    """Retrieve the current tournament for the authenticated user."""
    user = request.user
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        tournament = ManualTournament.objects.filter(
            status="ongoing", participants__user__id=user.id
        ).latest("created_at")
    except ManualTournament.DoesNotExist:
        return JsonResponse({"error": "No active tournament found for this user"}, status=404)

    matches = TournamentMatch.objects.filter(tournament=tournament).order_by("round_number", "match_order")

    size = {}
    for match in matches:
        player1_obj = None
        player2_obj = None
        winner_obj = None

        if match.player1_id:
            try:
                player1_obj = ManualUser.objects.get(id=match.player1_id)
            except ManualUser.DoesNotExist:
                logger.exception("Player 1 not found for match")
                return JsonResponse({"error": "Internal server error"}, status=500)

        if match.player2_id:
            try:
                player2_obj = ManualUser.objects.get(id=match.player2_id)
            except ManualUser.DoesNotExist:
                logger.exception("Player 2 not found for match")
                return JsonResponse({"error": "Internal server error"}, status=500)

        if match.winner_id:
            try:
                winner_obj = ManualUser.objects.get(id=match.winner_id)
            except ManualUser.DoesNotExist:
                return JsonResponse({"error": "Internal server error"}, status=500)


        if match.status in ["pending", "ready"] and not match.winner_id:
            p1_participant = None
            p2_participant = None
            if player1_obj:
                p1_participant = ManualTournamentParticipants.objects.filter(
                    tournament=tournament, user=player1_obj
                ).first()
            if player2_obj:
                p2_participant = ManualTournamentParticipants.objects.filter(
                    tournament=tournament, user=player2_obj
                ).first()

            if p1_participant and p1_participant.status == "left" and (not p2_participant or p2_participant.status != "left"):
                match.winner_id = match.player2_id
                match.score = "Forfeit"
                match.status = "completed"
                match.save()
                winner_obj = player2_obj

            elif p2_participant and p2_participant.status == "left" and (not p1_participant or p1_participant.status != "left"):
                match.winner_id = match.player1_id
                match.score = "Forfeit"
                match.status = "completed"
                match.save()
                winner_obj = player1_obj

        p1_display = player1_obj.username if player1_obj else "TBD"
        p2_display = player2_obj.username if player2_obj else "TBD"
        w_display = winner_obj.username if winner_obj else "TBD"

        if user.id in [match.player1_id, match.player2_id]:
            match_key = match.match_key
        else:
            match_key = None

        size.setdefault(match.round_number, []).append({
            "id": match.id,
            "player1": p1_display,
            "player2": p2_display,
            "status": match.status,
            "winner": w_display,
            "score": match.score,
            "match_key": match_key,
        })

    size_list = []
    for round_num in sorted(size.keys()):
        size_list.append({"round": f"Round {round_num}", "matches": size[round_num]})

    data = {
        "tournament_id": tournament.id,
        "serial_key": tournament.serial_key,
        "status": tournament.status,
        "participants": list(tournament.participants.all().values_list("user__username", flat=True)),
        "size": size_list,
        "mode": tournament.mode,
    }

    return JsonResponse(data)





@require_GET
@jwt_required
def getCurrentTournamentInformation(request):
    """Retrieve the information of the current tournament for the authenticated user."""
    try:
        user = request.user
    except ManualUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if user.current_tournament_id == 0:
        return JsonResponse(
            {
                "tournament": None,
                "message": "User is not participating in any tournament.",
                "user_id": user.id,
            }
        )

    try:
        tournament = ManualTournament.objects.get(id=user.current_tournament_id)
    except ManualTournament.DoesNotExist:
        return JsonResponse(
            {
                "tournament": None,
                "message": "Tournament not found.",
                "user_id": user.id,
            }
        )

    participants_qs = (
        ManualTournamentParticipants.objects.filter(tournament=tournament).exclude(status="rejected").select_related("user")
    )
    participants_list = [
        {
            "id": participant.user.id,
            "username": participant.user.username,
            "status": participant.status,
        }
        for participant in participants_qs
    ]

    data = {
        "user_id": user.id,
        "tournament_id": tournament.id,
        "serial_key": tournament.serial_key,
        "size": tournament.size,
        "status": tournament.status,
        "organizer_id": tournament.organizer.id if tournament.organizer else None,
        "participants": participants_list,
        "participants_count": len(participants_list),
        "participants_accepted": len([p for p in participants_list if p["status"] == "accepted"]),
        "mode": tournament.mode,
    }
    return JsonResponse(data)


@require_POST
@jwt_required
def update_match_result(request):
    """Update the result of a match in a tournament (LOCAL version, using usernames)."""
    try:
        body = json.loads(request.body.decode("utf-8"))
        tournament_id = body.get("tournament_id")
        winner_username = body.get("winner_id")
        loser_username = body.get("loser_id")
        final_scores = body.get("final_scores")
        p1_username = body.get("player1")
        p2_username = body.get("player2")

        if not (tournament_id and winner_username and loser_username and final_scores and p1_username and p2_username):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            tournament_id = int(tournament_id)
        except ValueError:
            return JsonResponse({"error": "Invalid tournament_id"}, status=400)

       
        try:
            winner_user = ManualUser.objects.get(username=winner_username)
            p1_user = ManualUser.objects.get(username=p1_username)
            p2_user = ManualUser.objects.get(username=p2_username)
        except ManualUser.DoesNotExist as e:
            logger.exception(f"User not found: {str(e)}")
            return JsonResponse({"error": "Internal server error"}, status=404)

        match = (
            TournamentMatch.objects.filter(
                tournament_id=tournament_id,
                player1_id=p1_user.id,
                player2_id=p2_user.id,
                status="pending",
            )
            .order_by("round_number")
            .first()
        )

        if not match:
            return JsonResponse({"error": "Match not found"}, status=404)

        match.winner_id = winner_user.id

        score1 = final_scores.get(p1_username, 0)
        score2 = final_scores.get(p2_username, 0)

        match.score = f"{score1}-{score2}"
        match.status = "completed"
        match.save()

        current_round = match.round_number
        current_match_order = match.match_order
        next_round = current_round + 1
        next_match_order = (current_match_order + 1) // 2

        try:
            next_match = TournamentMatch.objects.get(
                tournament_id=tournament_id,
                round_number=next_round,
                match_order=next_match_order,
            )
            if current_match_order % 2 == 1:
                next_match.player1_id = winner_user.id
            else:
                next_match.player2_id = winner_user.id

            next_match.save()
        except TournamentMatch.DoesNotExist:
            logger.info("Final match reached: no next match found.")

        return JsonResponse({"success": True, "message": "Match updated"})
    except Exception as e:
        logger.exception(f"Error updating local match result: {str(e)}")
        return JsonResponse({"Internal server error"}, status=500)



@require_POST
@jwt_required
def abandon_local_tournament(request):
    """Abandon a local tournament and remove all participants except the organizer."""
    try:
        organizer = request.user
        body = json.loads(request.body.decode("utf-8"))

        tournament_id = body.get("tournament_id")
        if not tournament_id:
            return JsonResponse({"error": "tournament_id is required"}, status=400)

        tournament = ManualTournament.objects.filter(id=tournament_id, organizer=organizer).first()
        if not tournament:
            return None

        TournamentMatch.objects.filter(tournament=tournament).delete()
        participants = ManualTournamentParticipants.objects.filter(
            tournament=tournament
        ).exclude(user=tournament.organizer)

        participant_users = [p.user for p in participants]
        participants.delete()

        for user in participant_users:
            if user.is_dummy:
                user.delete()

        tournament.delete()
        organizer.current_tournament_id = 0
        organizer.save()

        return JsonResponse({"success": True, "message": "Tournament abandoned and players removed except organizer"})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.exception(f"Error abandoning tournament: {str(e)}")
        return JsonResponse({"Internal server error"}, status=500)



def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode("utf-8")).decode("utf-8")

@require_POST
@jwt_required
def create_local_tournament_view(request):
    """Create a local tournament with the provided players."""
    user = request.user
    body = json.loads(request.body.decode("utf-8"))
    players = body.get("players", [])
    try:
        if len(players) not in [4, 8, 16]:
            logger.error(f"Invalid tournament size: {len(players)} players provided. Expected 4, 8, or 16.")
            return JsonResponse({"error": "Invalid tournament size"}, status=400)

        if user.current_tournament_id != 0:
            error_msg = f"User {user.id} is already in an active tournament."
            logger.warning(error_msg)
            return JsonResponse({"error": error_msg}, status=400)

        serial_key = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

        tournament = ManualTournament.objects.create(
            serial_key=serial_key,
            name="Local Tournament",
            organizer=user,
            size=len(players) // 2, 
            status="ongoing",
            mode="local",
        )

        users_list = []

        for username in players:
            if username == user.username:
                user_obj = user
            else:
                base_username = username
                new_username = base_username
                counter = 1

                while ManualUser.objects.filter(username=new_username).exists():
                    new_username = f"{base_username}_{counter}"
                    counter += 1

                user_obj = ManualUser.objects.create(
                    username=new_username,
                    email=encrypt_thing(f"{new_username.lower()}@local.fake"),
                    password="fakepassword",
                    is_dummy=True,
                )

            user_obj.tournament_status = "participating"
            user_obj.current_tournament_id = tournament.id
            user_obj.save()

            ManualTournamentParticipants.objects.create(
                tournament=tournament,
                user=user_obj,
                status="accepted"
            )

            users_list.append(user_obj)

        n = len(players)
        size_count = int(math.log2(n))

        for i in range(0, n, 2):
            match_order = (i // 2) + 1
            p1_user = users_list[i]
            p2_user = users_list[i + 1]

            TournamentMatch.objects.create(
                tournament=tournament,
                round_number=1,
                match_order=match_order,
                player1_id=p1_user.id,
                player2_id=p2_user.id,
                status="pending",
            )

        previous_matches = n // 2
        for round_number in range(2, size_count + 1):
            num_matches = previous_matches // 2
            for match_order in range(1, num_matches + 1):
                TournamentMatch.objects.create(
                    tournament=tournament,
                    round_number=round_number,
                    match_order=match_order,
                    player1_id=None,
                    player2_id=None,
                    status="pending",
                )
            previous_matches = num_matches

        response_data = {
            "success": True,
            "serial_key": serial_key,
            "tournament_id": tournament.id,
            "players": players,
        }
        return JsonResponse(response_data, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    except Exception as e:
        logger.exception("Error creating local tournament:")

        tournament = ManualTournament.objects.filter(id=user.current_tournament_id).first()
        if tournament:
            tournament.delete()
        user.current_tournament_id = 0
        user.save()

        for player in players:
            ManualUser.objects.filter(username=player, is_dummy=True).delete()

        logger.error(f"Exception error in create local tournament view: {str(e)}")
        return JsonResponse("Internal Error", safe=False, status=500)


@require_POST
@jwt_required
def try_join_random_tournament(request):
    """Join a random tournament."""
    try:
        body = json.loads(request.body.decode("utf-8"))

        user = request.user
        if not user:
            return JsonResponse({"message": "Unauthorized"}, status=401)

        if user.current_tournament_id != 0:
            return JsonResponse({"message": "User is already in a tournament"}, status=400)

        tournament_size = body.get("tournamentSize")
        if not tournament_size:
            return JsonResponse({"message": "Tournament size is required"}, status=400)

        tournament = (
            ManualTournament.objects.filter(status="upcoming", mode="online", size=tournament_size).order_by("created_at").first()
        )

        if not tournament:
            return JsonResponse({"error": "No upcoming tournament found"}, status=404)

        participant_count = ManualTournamentParticipants.objects.filter(
            tournament=tournament, status__in=["accepted", "pending"]
        ).count()

        if participant_count >= tournament_size:
            return JsonResponse({"message": "Tournament is full"}, status=400)

        ManualTournamentParticipants.objects.create(tournament=tournament, user=user, status="pending")

        return JsonResponse(
            {
                "success": True,
                "message": "User found a random tournament",
                "payload": {"userId": str(user.id), "tournament_id": str(tournament.id)},
            }
        )

    except ManualUser.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)

    except Exception as e:
        logger.exception("Error joining random tournament:")
        return JsonResponse({"message": "Internal server server"}, status=500)

@require_POST
@jwt_required
def try_join_tournament_with_room_code(request):
    """Join a tournament with a room code."""
    try:
        body = json.loads(request.body.decode("utf-8"))

        user = request.user
        if not user:
            return JsonResponse({"message": "Unauthorized"}, status=401)

        room_code = body.get("roomCode")
        if not room_code:
            return JsonResponse({"message": "roomCode is required"}, status=400)

        if user.current_tournament_id != 0:
            return JsonResponse({"message": "User is already in a tournament"}, status=400)

        tournament = ManualTournament.objects.filter(status="upcoming", mode="online", serial_key=room_code).first()

        if not tournament:
            return JsonResponse({"message": "No upcoming tournament found"}, status=404)

        participant_count = ManualTournamentParticipants.objects.filter(
            tournament=tournament, status__in=["accepted", "pending"]
        ).count()

        if participant_count >= tournament.size:
            return JsonResponse({"message": "Tournament is full"}, status=400)

        ManualTournamentParticipants.objects.create(tournament=tournament, user=user, status="pending")

        return JsonResponse(
            {
                "success": True,
                "message": "User joined the tournament",
                "payload": {"userId": user.id, "tournament_id": tournament.id},
            }
        )

    except Exception as e:
        logger.exception(f"Error joining tournament with room code: {str(e)}")
        return JsonResponse({"message": "Internal server error"}, status=500)
