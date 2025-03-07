import json
import redis
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

r = redis.Redis(host="redis", port=6379, db=0)

@csrf_exempt
def push_info_storage(request):
    """
    POST /storage/push/
    Body JSON: {"user_id": 123, "key": "roomCode", "value": "XYZ"}
    Stocke la valeur dans Redis avec expiration automatique de 1 heure.
    """
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"success": False, "error": "Invalid JSON body"}, status=400)

    user_id = data.get("user_id")
    key = data.get("key")
    value = data.get("value")

    if user_id is None or not key:
        return JsonResponse({"success": False, "error": "user_id and key are required"}, status=400)

    redis_key = f"user_storage:{user_id}:{key}"
    expiration_time = 3600  

    r.setex(redis_key, expiration_time, str(value)) 

    return JsonResponse({
        "success": True,
        "message": f"Value stored under key '{key}' for user_id={user_id} (expires in 1 hour)"
    })




@csrf_exempt
def get_info_storage(request):
    """
    GET /storage/get/?user_id=123&key=roomCode
    Récupère la valeur dans Redis.
    """
    if request.method != "GET":
        return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)

    user_id = request.GET.get("user_id")
    key = request.GET.get("key")

    if not user_id or not key:
        return JsonResponse({"success": False, "error": "user_id and key are required"}, status=400)

    redis_key = f"user_storage:{user_id}:{key}"
    stored_value = r.get(redis_key)

    if stored_value is None:
        return JsonResponse({"success": True, "key": key, "value": None}) 


    return JsonResponse({
        "success": True,
        "key": key,
        "value": stored_value.decode("utf-8")
    })


@csrf_exempt
def delete_info_storage(request):
    """
    DELETE /storage/delete/?user_id=123&key=roomCode
    Supprime la valeur dans Redis.
    """
    if request.method != "DELETE":
        return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)

    user_id = request.GET.get("user_id")
    key = request.GET.get("key")

    if not user_id or not key:
        return JsonResponse({"success": False, "error": "user_id and key are required"}, status=400)

    redis_key = f"user_storage:{user_id}:{key}"
    deleted = r.delete(redis_key)

    if not deleted:
        return JsonResponse({"success": True, "message": f"Key '{key}' for user_id={user_id} not found but considered deleted."})

    return JsonResponse({
        "success": True,
        "message": f"Key '{key}' for user_id={user_id} deleted."
    })
