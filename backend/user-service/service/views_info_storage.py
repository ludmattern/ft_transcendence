import json
import redis
from django.http import JsonResponse  # type: ignore



from service.views import jwt_required

r = redis.Redis(host="redis", port=6379, db=0)


@jwt_required
def push_info_storage(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "error": "Method not allowed"}, status=405
        )

    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"success": False, "error": "Invalid JSON body"}, status=400
        )

    user = request.user
    key = data.get("key")
    value = data.get("value")

    if not key:
        return JsonResponse({"success": False, "error": "Key is required"}, status=400)

    redis_key = f"user_storage:{user.id}:{key}"
    expiration_time = 3600

    r.setex(redis_key, expiration_time, str(value))

    return JsonResponse(
        {
            "success": True,
            "message": f"Value stored under key '{key}' for user_id={user.id} (expires in 1 hour)",
        }
    )


@jwt_required
def get_info_storage(request):
    """
    GET /storage/get/?key=roomCode
    Récupère la valeur dans Redis.
    """
    if request.method != "GET":
        return JsonResponse(
            {"success": False, "error": "Method not allowed"}, status=405
        )

    user = request.user
    key = request.GET.get("key")

    if not key:
        return JsonResponse({"success": False, "error": "Key is required"}, status=400)

    redis_key = f"user_storage:{user.id}:{key}"
    stored_value = r.get(redis_key)

    if stored_value is None:
        return JsonResponse({"success": True, "key": key, "value": None})

    return JsonResponse(
        {"success": True, "key": key, "value": stored_value.decode("utf-8")}
    )


@jwt_required
def delete_info_storage(request):
    """
    DELETE /storage/delete/?key=roomCode
    Supprime la valeur dans Redis.
    """
    if request.method != "DELETE":
        return JsonResponse(
            {"success": False, "error": "Method not allowed"}, status=405
        )

    user = request.user
    key = request.GET.get("key")

    if not key:
        return JsonResponse({"success": False, "error": "Key is required"}, status=400)

    redis_key = f"user_storage:{user.id}:{key}"
    deleted = r.delete(redis_key)

    if not deleted:
        return JsonResponse(
            {
                "success": True,
                "message": f"Key '{key}' not found but considered deleted.",
            }
        )

    return JsonResponse({"success": True, "message": f"Key '{key}' deleted."})
