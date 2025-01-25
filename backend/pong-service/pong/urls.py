from django.urls import path
from service.views import  join_matchmaking

urlpatterns = [
    path('join_matchmaking/<str:user_id>/', join_matchmaking, name='join_matchmaking'),
]