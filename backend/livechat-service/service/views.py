from django.shortcuts import render  # type: ignore
from service.models import ManualUser


def chat_room(request):
    return render(request, "chat_room.html")


def get_username(username):
    try:
        user = ManualUser.objects.get(username=username)
        return user.username
    except ManualUser.DoesNotExist:
        return None


def check_username_exists(username):
    return ManualUser.objects.filter(username=username).exists()
