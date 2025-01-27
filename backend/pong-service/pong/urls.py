from django.urls import path
from service.views import  join_matchmaking, leave_matchmaking

urlpatterns = [
    path('join_matchmaking/<str:user_id>/', join_matchmaking, name='join_matchmaking'),
    path('leave_matchmaking/<str:user_id>/', leave_matchmaking, name='leave_matchmaking'),

]