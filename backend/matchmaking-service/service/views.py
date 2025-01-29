import json
from django.http import JsonResponse
from .matchmaking_manager import matchmaking_manager
from .private_manager import private_manager

def join_matchmaking(request, user_id):
    if not user_id:
        return JsonResponse({"error": "No user_id provided"}, status=400)
    result = matchmaking_manager.join_queue(user_id)
    if result:
        return JsonResponse({"status": "matched", **result})
    return JsonResponse({"status": "waiting"})

def leave_matchmaking(request, user_id):
    matchmaking_manager.remove_from_queue(user_id)
    return JsonResponse({"status": "removed"})

def join_room(request):
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code/user_id"}, status=400)

    result = private_manager.join_room(room_code, user_id)
    if result:
        return JsonResponse({"status": "matched", **result})
    return JsonResponse({"status": "waiting"})

def leave_room(request):
    data = json.loads(request.body)
    room_code = data.get("room_code")
    user_id = data.get("user_id")
    if not room_code or not user_id:
        return JsonResponse({"error": "Missing room_code/user_id"}, status=400)

    private_manager.remove_from_room(room_code, user_id)
    return JsonResponse({"status": "removed"})
