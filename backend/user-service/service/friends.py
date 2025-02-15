import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .models import ManualUser, ManualFriendsRelations

@csrf_exempt
def get_friends(request):
    """Retrieve all accepted friends for a user."""
    if request.method == "GET":
        username = request.GET.get("username")
        user = ManualUser.objects.filter(username=username).first()

        if not user:
            return JsonResponse({"error": "User not found"}, status=404)

        friends = ManualUser.objects.filter(
            Q(friends_initiated__friend=user, friends_initiated__status="accepted") |
            Q(friends_received__user=user, friends_received__status="accepted")
        ).distinct()

        friends_list = [{"id": friend.id, "username": friend.username} for friend in friends]

        return JsonResponse({"friends": friends_list}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def send_friend_request(request):
    """Send a friend request if it doesn’t already exist."""
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            user = ManualUser.objects.filter(username=body.get("username")).first()
            friend = ManualUser.objects.filter(username=body.get("selecteduser")).first()

            if not user or not friend:
                return JsonResponse({"error": "User or friend not found"}, status=404)

            if user == friend:
                return JsonResponse({"error": "You cannot send a friend request to yourself"}, status=400)

            relation, created = ManualFriendsRelations.objects.get_or_create(
                user=user, friend=friend, defaults={"status": "pending"}
            )

            if not created:
                return JsonResponse({"message": "Friend request already sent"}, status=409)

            return JsonResponse({"message": "Friend request sent"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def accept_friend_request(request):
    """Accept an existing friend request."""
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            user = ManualUser.objects.filter(username=body.get("username")).first()
            friend = ManualUser.objects.filter(username=body.get("selecteduser")).first()

            if not user or not friend:
                return JsonResponse({"error": "User or friend not found"}, status=404)

            relation = ManualFriendsRelations.objects.filter(user=friend, friend=user, status="pending").first()
            if not relation:
                return JsonResponse({"error": "No pending friend request"}, status=404)

            relation.status = "accepted"
            relation.save()

            return JsonResponse({"message": "Friend request accepted"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def reject_friend_request(request):
    """Reject an existing friend request."""
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            user = ManualUser.objects.filter(username=body.get("username")).first()
            friend = ManualUser.objects.filter(username=body.get("selecteduser")).first()

            if not user or not friend:
                return JsonResponse({"error": "User or friend not found"}, status=404)

            relation = ManualFriendsRelations.objects.filter(user=friend, friend=user, status="pending").first()
            if not relation:
                return JsonResponse({"error": "No pending friend request"}, status=404)

            relation.status = "rejected"
            relation.save()

            return JsonResponse({"message": "Friend request rejected"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def remove_friend(request):
    """Remove a friendship (both sides)."""
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            user = ManualUser.objects.filter(username=body.get("username")).first()
            friend = ManualUser.objects.filter(username=body.get("selecteduser")).first()

            if not user or not friend:
                return JsonResponse({"error": "User or friend not found"}, status=404)

            deleted_count, _ = ManualFriendsRelations.objects.filter(
                Q(user=user, friend=friend) | Q(user=friend, friend=user)
            ).delete()

            if deleted_count == 0:
                return JsonResponse({"error": "Friendship not found"}, status=404)

            return JsonResponse({"message": "Friend removed"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)
