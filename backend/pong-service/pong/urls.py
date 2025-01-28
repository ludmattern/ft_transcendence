from django.urls import path
from service.views import  join_matchmaking, leave_matchmaking, join_room, leave_room

urlpatterns = [
    path('join_matchmaking/<str:user_id>/', join_matchmaking, name='join_matchmaking'),
    path('leave_matchmaking/<str:user_id>/', leave_matchmaking, name='leave_matchmaking'),
    path("join_private_room/", join_room, name="join_private_room"),
    path('leave_private_room/', leave_room, name='leave_private_room'),

]
