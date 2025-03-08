import json
import logging
from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.core.exceptions import ObjectDoesNotExist  # type: ignore
from django.db.models import Q  # type: ignore
from .models import ManualUser, ManualFriendsRelations
from service.views import jwt_required
logger = logging.getLogger(__name__)

@csrf_exempt
@jwt_required 
def get_friends(request):
    """Retrieve all accepted friends for the authenticated user."""
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        user = request.user

        friends = (
            ManualUser.objects.filter(
                Q(friends_initiated__friend=user, friends_initiated__status="accepted")
                | Q(friends_received__user=user, friends_received__status="accepted")
            )
            .distinct()
            .values("id", "username", "is_connected")
        )

        return JsonResponse({"friends": list(friends)}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



from service.views import jwt_required  


@csrf_exempt
def is_friend(request):
    logger.info("Checking if two users are friends")
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)
    try:
        body = json.loads(request.body)
        other_user_id = body.get("otherUserId")
        if not other_user_id:
            return JsonResponse({"success": False, "error": "otherUserId is required"}, status=400)

        user = request.user
        friend = ManualUser.objects.filter(id=other_user_id).first()

        if not friend:
            return JsonResponse({"success": False, "error": "Friend not found"}, status=404)

        is_friend = ManualFriendsRelations.objects.filter(
            Q(user=user, friend=friend, status="accepted") |
            Q(user=friend, friend=user, status="accepted")
        ).exists()
        return JsonResponse({"success": True, "is_friend": is_friend}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON data"}, status=400)
