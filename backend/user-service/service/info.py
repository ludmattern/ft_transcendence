import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import (
    ManualUser, ManualBlockedRelations, ManualFriendsRelations, 
    ManualTournament, ManualTournamentParticipants, ManualNotifications
)
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
def info_getter(request, user_id):
    logger.info(f"Received request for user_id: {user_id}")

    if request.method != "GET":
        return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)

    try:
        user = ManualUser.objects.get(pk=user_id)
        logger.info(f"User found: {user.username}")
    except ManualUser.DoesNotExist:
        logger.warning(f"User with ID {user_id} not found")
        return JsonResponse({"success": False, "error": "User not found"}, status=404)

    # Basic user info
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }

    # Friends (Accepted & Pending)
    friends = ManualFriendsRelations.objects.filter(user=user, status="accepted").values("friend__id", "friend__username")
    friend_requests = ManualFriendsRelations.objects.filter(friend=user, status="pending").select_related("user")

    friend_request_data = [
        {
            "type": "friend_request",
            "inviter": fr.user.username,
            "inviter_id": fr.user.id,
            "actions": True,
        }
        for fr in friend_requests
    ]

    # Blocked users
    blocked_users = ManualBlockedRelations.objects.filter(user=user).values("blocked_user__id", "blocked_user__username")

    # Tournaments Participated In
    tournament_participants = ManualTournamentParticipants.objects.filter(user=user).select_related("tournament")
    tournaments = [
        {
            "tournament_id": tp.tournament.id,
            "name": tp.tournament.name,
            "status": tp.tournament.status,
            "rounds": tp.tournament.rounds,
            "organizer_id": tp.tournament.organizer.id,
            "organizer_name": tp.tournament.organizer.username,
            "user_status": tp.status,  # Pending, accepted, eliminated, etc.
        }
        for tp in tournament_participants
    ]

    # Tournament Invitations
    tournament_invites = ManualNotifications.objects.filter(receiver=user, type="tournament_invite").select_related("sender", "tournament")
    tournament_invite_data = [
        {
            "type": "tournament_invite",
            "inviter": invite.sender.username,
            "inviter_id": invite.sender.id,
            "tournament": invite.tournament.name if invite.tournament else None,
            "tournament_id": invite.tournament.id if invite.tournament else None,
            "actions": True,
        }
        for invite in tournament_invites
    ]

    # Notifications
    notifications = ManualNotifications.objects.filter(receiver=user).select_related("sender", "tournament", "game")
    notifications_data = [
        {
            "type": notif.type,
            "inviter": notif.sender.username if notif.sender else "System",
            "inviter_id": notif.sender.id if notif.sender else None,
            "status": notif.status,
            "tournament": notif.tournament.name if notif.tournament else None,
            "tournament_id": notif.tournament.id if notif.tournament else None,
            "game_id": notif.game.game_id if notif.game else None,
            "actions": notif.type in ["friend_request", "tournament_invite", "private_game_invite"],
        }
        for notif in notifications
    ]

    # Final response
    response_data = {
        "user": user_data,
        "friends": list(friends),
        "friend_requests": friend_request_data,
        "blocked_users": list(blocked_users),
        "tournaments": tournaments,
        "notifications": notifications_data + tournament_invite_data,  # Merge all notifications
    }

    return JsonResponse(response_data, safe=False, json_dumps_params={'indent': 4})
