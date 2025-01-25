from django.urls import path
from service import views

urlpatterns = [
    path('join_matchmaking/', views.join_matchmaking, name='join_matchmaking'),
]