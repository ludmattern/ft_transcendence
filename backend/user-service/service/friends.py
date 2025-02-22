import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db.models import Q
from .models import ManualUser, ManualFriendsRelations

logger = logging.getLogger(__name__)

# GET FRIENDS (Optimized)
@csrf_exempt
def get_friends(request):
	"""Retrieve all accepted friends for a user."""
	if request.method == "GET":
		user_id = request.GET.get("userId")

		try:
			user = ManualUser.objects.get(id=user_id)
		except ObjectDoesNotExist:
			return JsonResponse({"error": "User not found"}, status=404)

		friends = ManualUser.objects.filter(
			Q(friends_initiated__friend=user, friends_initiated__status="accepted") |
			Q(friends_received__user=user, friends_received__status="accepted")
		).distinct().values("id", "username")

		return JsonResponse({"friends": list(friends)}, status=200)

	return JsonResponse({"error": "Invalid request method"}, status=405)

# SEND FRIEND REQUEST (Optimized)
@csrf_exempt
def send_friend_request(request):
	"""Send a friend request."""
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			user_id = body.get("userId")
			selected_user_id = body.get("selectedUserId")

			if not user_id or not selected_user_id:
				return JsonResponse({"error": "Missing userId or selectedUserId"}, status=400)

			if user_id == selected_user_id:
				return JsonResponse({"error": "You cannot send a friend request to yourself"}, status=400)

			user = ManualUser.objects.get(id=user_id)
			friend = ManualUser.objects.get(id=selected_user_id)

			# Normaliser l'ordre si besoin (selon votre logique)
			if user.id > friend.id:
				user, friend = friend, user

			qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
			if qs.exists():
				relation = qs.first()
				# Si la demande est en attente et que l'autre utilisateur l'avait initiée
				if relation.status == "pending" and str(relation.initiator.id) != str(user.id):
					relation.status = "accepted"
					relation.save()
					return JsonResponse({"message": "Friend request accepted"}, status=200)
				else:
					return JsonResponse({"message": "Friend request already sent"}, status=409)

			# Créer une nouvelle demande en indiquant qui l'initie
			ManualFriendsRelations.objects.create(user=user, friend=friend, status="pending", initiator=user)
			return JsonResponse({"message": "Friend request sent"}, status=201)

		except ObjectDoesNotExist:
			return JsonResponse({"error": "User not found"}, status=404)
		except json.JSONDecodeError:
			return JsonResponse({"error": "Invalid JSON data"}, status=400)

	return JsonResponse({"error": "Invalid request method"}, status=405)

# ACCEPT FRIEND REQUEST (Optimized)
@csrf_exempt
def accept_friend_request(request):
	"""Accept a pending friend request."""
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			user_id = body.get("userId")
			selected_user_id = body.get("selectedUserId")

			user = ManualUser.objects.get(id=user_id)
			friend = ManualUser.objects.get(id=selected_user_id)

			relation = ManualFriendsRelations.objects.get(user=friend, friend=user, status="pending")
			relation.status = "accepted"
			relation.save()

			return JsonResponse({"message": "Friend request accepted"}, status=200)

		except ObjectDoesNotExist:
			return JsonResponse({"error": "No pending friend request or user not found"}, status=404)
		except json.JSONDecodeError:
			return JsonResponse({"error": "Invalid JSON data"}, status=400)

	return JsonResponse({"error": "Invalid request method"}, status=405)

# REJECT FRIEND REQUEST (Optimized)
@csrf_exempt
def reject_friend_request(request):
	"""Reject a pending friend request."""
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			user_id = body.get("userId")
			selected_user_id = body.get("selectedUserId")

			user = ManualUser.objects.get(id=user_id)
			friend = ManualUser.objects.get(id=selected_user_id)

			relation = ManualFriendsRelations.objects.get(user=friend, friend=user, status="pending")
			relation.status = "rejected"
			relation.save()

			return JsonResponse({"message": "Friend request rejected"}, status=200)

		except ObjectDoesNotExist:
			return JsonResponse({"error": "No pending friend request or user not found"}, status=404)
		except json.JSONDecodeError:
			return JsonResponse({"error": "Invalid JSON data"}, status=400)

	return JsonResponse({"error": "Invalid request method"}, status=405)

# REMOVE FRIEND (Both Sides)
@csrf_exempt
def remove_friend(request):
	"""Remove a friendship (both sides)."""
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			user_id = body.get("userId")
			selected_user_id = body.get("selectedUserId")

			user = ManualUser.objects.get(id=user_id)
			friend = ManualUser.objects.get(id=selected_user_id)

			deleted_count, _ = ManualFriendsRelations.objects.filter(
				Q(user=user, friend=friend) | Q(user=friend, friend=user)
			).delete()

			if deleted_count == 0:
				return JsonResponse({"error": "Friendship not found"}, status=404)

			return JsonResponse({"message": "Friend removed"}, status=200)

		except ObjectDoesNotExist:
			return JsonResponse({"error": "User not found"}, status=404)
		except json.JSONDecodeError:
			return JsonResponse({"error": "Invalid JSON data"}, status=400)

	return JsonResponse({"error": "Invalid request method"}, status=405)

def is_friend(request):
	"""Check if two users are friends."""
	logger.info("Checking if two users are friends")
	if request.method == "POST":
		try:
			body = json.loads(request.body)
			user = ManualUser.objects.filter(id=body.get("userId")).first()
			friend = ManualUser.objects.filter(id=body.get("otherUserId")).first()

			if not user or not friend:
				return JsonResponse({"success": False, "error": "User or friend not found"}, status=404)

			is_friend = ManualFriendsRelations.objects.filter(
				Q(user=user, friend=friend, status="accepted") |
				Q(user=friend, friend=user, status="accepted")
			).exists()

			return JsonResponse({"success": True, "is_friend": is_friend}, status=200)

		except json.JSONDecodeError:
			return JsonResponse({"success": False,"error": "Invalid JSON data"}, status=400)

	return JsonResponse({"success": False,"error": "Invalid request method"}, status=405)
