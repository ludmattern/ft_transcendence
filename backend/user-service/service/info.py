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

    friend_requests = (
        ManualFriendsRelations.objects.filter(status="pending")
        .filter(Q(user=user) | Q(friend=user))
        .exclude(initiator=user)
        .select_related("initiator")
        .values("initiator__id", "initiator__username")
    )

    friend_request_data = [
        {
            "type": "friend_request",
            "inviter_id": fr["initiator__id"],
            "inviter": fr["initiator__username"],
            "actions": "choice",
        }
        for fr in friend_requests
    ]

    pending_invites = ManualTournamentParticipants.objects.filter(user=user, status="pending").select_related(
        "tournament__organizer"
    )

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


    pending_private_game_invites = ManualPrivateGames.objects.filter(
        (Q(user=user, recipient__gt=user) | Q(recipient=user, user__lt=user)) & ~Q(initiator=user), status="pending"
    ).select_related("initiator")


    private_game_invite_data = [
        {
            "type": "private_game_invite",
            "inviter_id": invite.initiator.id,
            "inviter": invite.initiator.username,
            "actions": "choice",
        }
        for invite in pending_private_game_invites
    ]


    if not user.current_tournament_id:
        logger.info("No current tournament")
        return JsonResponse({"success": True, "info": friend_request_data + tournament_invite_data + private_game_invite_data})

    next_ready_matches = TournamentMatch.objects.filter(
        Q(player1_id=user.id) | Q(player2_id=user.id),
        status="ready",
        tournament_id=user.current_tournament_id
    )

    next_match_data = []

    for match in next_ready_matches:
        player1User = ManualUser.objects.get(id=match.player1_id) if match.player1_id else None
        player2User = ManualUser.objects.get(id=match.player2_id) if match.player2_id else None
        
        inviter_user = player1User if match.player2_id == user.id else player2User
        inviter = inviter_user.username if inviter_user else "TBD"
        inviter_id = inviter_user.id if inviter_user else None

        

        next_match_data.append(
            {"type": "tournament_next_game", "inviter": inviter, "inviter_id": inviter_id, "actions": "acknowledge"}
        )

    response_data = {
        "success": True,
        "info": friend_request_data + tournament_invite_data + next_match_data + private_game_invite_data,
    }

    return JsonResponse(response_data, safe=False, json_dumps_params={"indent": 4})
