import json
import logging
from django.http import JsonResponse  # type: ignore

from django.db.models import Q  # type: ignore
from .models import ManualUser, ManualFriendsRelations, ManualBlockedRelations
from service.views import jwt_required
from django.views.decorators.http import require_POST, require_GET

logger = logging.getLogger(__name__)


@require_GET
@jwt_required
def get_friends(request):
    try:
        user = request.user

        friends = ManualUser.objects.filter(Q(friends_initiated__friend=user, friends_initiated__status="accepted") | Q(friends_received__user=user, friends_received__status="accepted")).distinct().values("id", "username", "is_connected")

        return JsonResponse({"friends": list(friends)}, status=200)

    except Exception as e:
        logger.error("An error occurred in retreiving friends: %s", str(e))
        return JsonResponse({"error": "An internal error has occurred"}, status=500)


@require_POST
@jwt_required
def get_relationship_status(request):
    logger.info("Checking relationship status between two users")
    try:
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON data"}, status=400)

        other_user_id = body.get("otherUserId")
        if not other_user_id:
            return JsonResponse({"success": False, "error": "otherUserId is required"}, status=400)

        try:
            other_user_id = int(other_user_id)
        except (ValueError, TypeError):
            return JsonResponse({"success": False, "error": "otherUserId must be an integer"}, status=400)

        user = request.user

        is_me = user.id == other_user_id
        if is_me:
            return JsonResponse({"success": True, "is_friend": False, "is_blocked": False, "is_me": True, "can_unblock": False}, status=200)

        friend = ManualUser.objects.filter(id=other_user_id).first()
        if not friend:
            return JsonResponse({"success": False, "error": "User not found"}, status=404)

        is_friend = ManualFriendsRelations.objects.filter(Q(user=user, friend=friend, status="accepted") | Q(user=friend, friend=user, status="accepted")).exists()

        block_relation_user = ManualBlockedRelations.objects.filter(user=user, blocked_user=friend).first()
        block_relation_friend = ManualBlockedRelations.objects.filter(user=friend, blocked_user=user).first()
        is_blocked = (block_relation_user is not None) or (block_relation_friend is not None)
        can_unblock = block_relation_user is not None

        return JsonResponse({"success": True, "is_friend": is_friend, "is_blocked": is_blocked, "is_me": False, "can_unblock": can_unblock}, status=200)
    except Exception as e:
        logger.error("An error occurred in get_relationship_status: %s", str(e))
        return JsonResponse({"success": False, "error": "An internal error has occurred!"}, status=500)
