from django.urls import path  # type: ignore
from service import views

urlpatterns = [
    path("chat/<str:user_id>/", views.chat_room, name="chat_room"),
]
