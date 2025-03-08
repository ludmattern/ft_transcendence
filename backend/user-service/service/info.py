import json
import logging
from django.http import JsonResponse  # type: ignore
from django.core.exceptions import ObjectDoesNotExist  # type: ignore
from django.db.models import Q  # type: ignore
from .models import (
    ManualUser,
    ManualFriendsRelations,
    ManualTournamentParticipants,
    TournamentMatch,
)

logger = logging.getLogger(__name__)


def info_getter(request, user_id):
    logger.info(f"Received request for user_id: {user_id}")

    if request.method != "GET":
        return JsonResponse(
            {"success": False, "error": "Invalid request method"}, status=405
        )

    try:
        user = ManualUser.objects.get(pk=user_id)
        logger.info(f"User found: {user.username}")
    except ObjectDoesNotExist:
        logger.warning(f"User with ID {user_id} not found")
        return JsonResponse({"success": False, "error": "User not found"}, status=404)

    # Récupération des demandes d'amis en attente
    friend_requests = (
        ManualFriendsRelations.objects.filter(status="pending")
        .filter(Q(user=user) | Q(friend=user))
        .exclude(initiator=user)
        .select_related("initiator")
        .values("initiator__id", "initiator__username")
    )

    logger.info(f"Friend requests: {friend_requests}")

    friend_request_data = [
        {
            "type": "friend_request",
            "inviter_id": fr["initiator__id"],
            "inviter": fr["initiator__username"],
            "actions": "choice",
        }
        for fr in friend_requests
    ]

    logger.info(f"Friend request data: {friend_request_data}")

    # Récupération des invitations de tournoi en attente
    pending_invites = ManualTournamentParticipants.objects.filter(
        user=user, status="pending"
    ).select_related("tournament__organizer")

    logger.info(f"Pending tournament invites: {pending_invites}")

    tournament_invite_data = [
        {
            "type": "tournament_invite",
            "inviter_id": invite.tournament.organizer.id,
            "inviter": invite.tournament.organizer.username,
            "tournament_id": invite.tournament.id,
            "tournament_name": invite.tournament.name,
            "actions": "choice",
        }
        for invite in pending_invites
    ]

    logger.info(f"Tournament invite data: {tournament_invite_data}")

    # private_game_invite_data = [
    #     {
    #         "type": "private_game_invite",
    #         "inviter_id": ,
    #         "inviter": ,
    #         "actions": "choice"
    #     }
    #     for private_game_invite in pending_private_game_invites
    # ]

    if not user.current_tournament_id:
        logger.info("No current tournament")
        return JsonResponse(
            {"success": True, "info": friend_request_data + tournament_invite_data}
        )

    next_ready_matches = TournamentMatch.objects.filter(
        Q(player1=user.username) | Q(player2=user.username),
        status="ready",
        tournament_id=user.current_tournament_id,
    )
    logger.info(f"Pending matches: {next_ready_matches}")

    next_match_data = [
        {
            "type": "tournament_next_game",
            "inviter": match.player1
            if match.player2 == user.username
            else match.player2,
            "actions": "acknowledge",
        }
        for match in next_ready_matches
    ]

    logger.info(f"next match data: {next_match_data}")

    response_data = {
        "success": True,
        "info": friend_request_data + tournament_invite_data + next_match_data,
    }

    logger.info(f"Response data: {json.dumps(response_data, indent=4)}")

    return JsonResponse(response_data, safe=False, json_dumps_params={"indent": 4})
