import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from .models import (
    ManualUser, ManualBlockedRelations, ManualFriendsRelations, 
    ManualTournamentParticipants, ManualNotifications
)

logger = logging.getLogger(__name__)

@csrf_exempt
def info_getter(request, user_id):
    logger.info(f"Received request for user_id: {user_id}")

    if request.method != "GET":
        return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)

    try:
        user = ManualUser.objects.get(pk=user_id)  # Fetch user by ID
        logger.info(f"User found: {user.username}")
    except ObjectDoesNotExist:
        logger.warning(f"User with ID {user_id} not found")
        return JsonResponse({"success": False, "error": "User not found"}, status=404)

    friend_requests = (
        ManualFriendsRelations.objects
        .filter(friend=user, status="pending")
        .select_related("user")  # Optimized query
        .values("user__id", "user__username")  # Fetch user ID & username
    )
    
    logger.info(f"Friend requests: {friend_requests}")

    friend_request_data = [
        {
            "type": "friend_request",
            "inviter_id": fr["user__id"],  # Fetch inviter's user ID
            "inviter": fr["user__username"],  # Fetch inviter's username
            "actions": True,
        }
        for fr in friend_requests
    ]
    
    logger.info(f"Friend request data: {friend_request_data}")

    tournament_invites = (
        ManualNotifications.objects
        .filter(receiver=user, type="tournament_invite")
        .select_related("sender")  # Optimized query
        .values("sender__id", "sender__username")  # Fetch sender ID & username
    )

    logger.info(f"Tournament invites: {tournament_invites}")

    tournament_invite_data = [
        {
            "type": "tournament_invite",
            "inviter_id": invite["sender__id"],  # Fetch inviter's user ID
            "inviter": invite["sender__username"],  # Fetch inviter's username
            "actions": False,
        }
        for invite in tournament_invites
    ]

    logger.info(f"Tournament invite data: {tournament_invite_data}")

    response_data = {
        "success": True,
        "info": friend_request_data + tournament_invite_data
    }

    logger.info(f"Response data: {json.dumps(response_data, indent=4)}")

    return JsonResponse(response_data, safe=False, json_dumps_params={'indent': 4})
