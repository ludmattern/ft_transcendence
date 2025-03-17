import json
import logging
from django.http import JsonResponse  # type: ignore
from django.core.exceptions import ObjectDoesNotExist  # type: ignore # noqa
from django.db.models import Q  # type: ignore
from .models import (
    ManualUser,
    ManualFriendsRelations,
    ManualTournamentParticipants,
    TournamentMatch,
    ManualPrivateGames,
)
from service.views import jwt_required
from django.views.decorators.http import require_GET


logger = logging.getLogger(__name__)

@require_GET
@jwt_required
def info_getter(request):
    """GET /info/get/"""
    user = request.user
    logger.info(f"Current user: {user.id} - {user.username}")

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

    pending_invites = ManualTournamentParticipants.objects.filter(user=user, status="pending").select_related(
        "tournament__organizer"
    )

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

    pending_private_game_invites = ManualPrivateGames.objects.filter(
        (Q(user=user, recipient__gt=user) | Q(recipient=user, user__lt=user)) & ~Q(initiator=user), status="pending"
    ).select_related("initiator")

    logger.debug(f"Pending private game invites query: {pending_private_game_invites.query}")
    logger.info(f"Pending private game invites: {pending_private_game_invites}")

    private_game_invite_data = [
        {
            "type": "private_game_invite",
            "inviter_id": invite.initiator.id,
            "inviter": invite.initiator.username,
            "actions": "choice",
        }
        for invite in pending_private_game_invites
    ]

    logger.info(f"Private game invite data: {private_game_invite_data}")

    if not user.current_tournament_id:
        logger.info("No current tournament")
        return JsonResponse({"success": True, "info": friend_request_data + tournament_invite_data + private_game_invite_data})

    next_ready_matches = TournamentMatch.objects.filter(
        Q(player1=user.username) | Q(player2=user.username), status="ready", tournament_id=user.current_tournament_id
    )

    logger.info(f"Pending matches: {next_ready_matches}")

    next_match_data = []

    for match in next_ready_matches:
        player1User = ManualUser.objects.get(username=match.player1)
        player2User = ManualUser.objects.get(username=match.player2)

        inviter = match.player1 if match.player2 == user.username else match.player2
        inviter_id = player1User.id if match.player2 == user.username else player2User.id

        next_match_data.append(
            {"type": "tournament_next_game", "inviter": inviter, "inviter_id": inviter_id, "actions": "acknowledge"}
        )

    logger.info(f"next match data: {next_match_data}")

    response_data = {
        "success": True,
        "info": friend_request_data + tournament_invite_data + next_match_data + private_game_invite_data,
    }

    logger.info(f"Response data: {json.dumps(response_data, indent=4)}")

    return JsonResponse(response_data, safe=False, json_dumps_params={"indent": 4})
