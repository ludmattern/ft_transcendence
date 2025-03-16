from django.shortcuts import render  # type: ignore
# from service.models import ManualUser

def chat_room(request):
    return render(request, "chat_room.html")
