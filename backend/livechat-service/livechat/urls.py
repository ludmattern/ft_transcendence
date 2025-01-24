from django.urls import path
from service import views

urlpatterns = [
    path('chat/', views.chat_room, name='chat_room'),
]
