import json
from django.http import JsonResponse  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from .models import ManualUser, ManualBlockedRelations


@csrf_exempt
def is_blocked(request):
    """Check if a user is blocked."""
    if request.method == "POST":
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

    return JsonResponse({"error": "Invalid request method"}, status=405)


# WILL NEED TO GET THOSE IN CONSUMERS.PY
# @csrf_exempt
# def block_user(request):
#     """Block a user."""
#     if request.method == "POST":
#         try:
#             body = json.loads(request.body.decode("utf-8"))
#             user = ManualUser.objects.filter(username=body.get("username")).first()
#             blocked_user = ManualUser.objects.filter(username=body.get("selecteduser")).first()

#             if not user or not blocked_user:
#                 return JsonResponse({"error": "User or blocked user not found"}, status=404)

#             if user == blocked_user:
#                 return JsonResponse({"error": "You cannot block yourself"}, status=400)

#             _, created = ManualBlockedRelations.objects.get_or_create(user=user, blocked_user=blocked_user)

#             if not created:
#                 return JsonResponse({"message": "User is already blocked"}, status=409)

#             return JsonResponse({"message": "User blocked successfully"}, status=201)

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Invalid JSON data"}, status=400)

#     return JsonResponse({"error": "Invalid request method"}, status=405)


# @csrf_exempt
# def unblock_user(request):
#     """Unblock a user."""
#     if request.method == "POST":
#         try:
#             body = json.loads(request.body.decode("utf-8"))
#             user = ManualUser.objects.filter(username=body.get("username")).first()
#             blocked_user = ManualUser.objects.filter(username=body.get("selecteduser")).first()

#             if not user or not blocked_user:
#                 return JsonResponse({"error": "User or blocked user not found"}, status=404)

#             deleted_count, _ = ManualBlockedRelations.objects.filter(user=user, blocked_user=blocked_user).delete()

#             if deleted_count == 0:
#                 return JsonResponse({"error": "User is not blocked"}, status=404)

#             return JsonResponse({"message": "User unblocked successfully"}, status=200)

#         except json.JSONDecodeError:
#             return JsonResponse({"error": "Invalid JSON data"}, status=400)

#     return JsonResponse({"error": "Invalid request method"}, status=405)
