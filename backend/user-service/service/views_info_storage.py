import json
import redis
from django.http import JsonResponse  # type: ignore
from django.views.decorators.http import require_POST, require_GET
from functools import wraps
import os
from service.views import jwt_required


r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=0,
    password=os.getenv("REDIS_PASS"),
)


@require_POST
@jwt_required
def push_info_storage(request):
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

@require_GET
@jwt_required
def get_info_storage(request):
    """
    GET /storage/get/?key=roomCode
    """
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

def require_DELETE(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.method != 'DELETE':
            return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


@require_DELETE
@jwt_required
def delete_info_storage(request):
    """
    DELETE /storage/delete/?key=roomCode
    """
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
