import json
from django.http import JsonResponse  # type: ignore
from .models import ManualUser
from service.views import jwt_required
from django.views.decorators.http import require_GET


@require_GET
@jwt_required
def profile_info(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        username = body.get("username")

        user = ManualUser.objects.get(username=username)

        return JsonResponse({"success": True, "message": "Profile loaded correctly", "winrate": user.winrate, "rank": user.rank}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON body"}, status=400)
    except ManualUser.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
