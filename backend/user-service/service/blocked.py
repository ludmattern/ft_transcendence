import json
from django.http import JsonResponse  # type: ignore

# Need to get rid of this import

from .models import ManualUser, ManualBlockedRelations
from django.views.decorators.http import require_POST


@require_POST
def is_blocked(request):
    """Check if a user is blocked."""
    try:
        body = json.loads(request.body.decode("utf-8"))
        user = ManualUser.objects.filter(username=body.get("username")).first()
        blocked_user = ManualUser.objects.filter(
            username=body.get("selecteduser")
        ).first()

        if not user or not blocked_user:
            return JsonResponse(
                {"error": "User or blocked user not found"}, status=404
            )

        is_blocked = ManualBlockedRelations.objects.filter(
            user=user, blocked_user=blocked_user
        ).exists()
        return JsonResponse({"is_blocked": is_blocked}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
