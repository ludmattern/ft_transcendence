import json
from django.http import JsonResponse  # type: ignore
from .models import ManualUser, ManualGameHistory
from service.views import jwt_required
from django.views.decorators.http import require_GET,require_POST

@require_GET
@jwt_required
def profile_info(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        username = body.get("username")

        user = ManualUser.objects.get(username=username)

        return JsonResponse(
            {
                "success": True,
                "message": "Profile loaded correctly",
                "winrate": user.winrate,
                "rank": user.rank,
            },
            status=200,
        )
    except ManualUser.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User not found"}, status=404
        )

@require_POST
def winrate_update(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        username = body.get("username")
        win = body.get("win")
        game = body.get("game")

        user = ManualUser.objects.get(username=username)
        game = ManualGameHistory.objects.get(game=game)

        if win:
            user.total_wins += 1
        else:
            user.total_losses += 1

        user.total_games += 1
        user.winrate = user.total_wins / user.total_games

        user.save()

        return JsonResponse(
            {"success": True, "message": "Winrate updated correctly"}, status=200
        )
    except ManualUser.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "User not found"}, status=404
        )
    except ManualGameHistory.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "Game not found"}, status=404
        )