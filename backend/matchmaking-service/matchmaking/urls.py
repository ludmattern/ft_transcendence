from django.urls import path
from service.views import (
    list_tournaments, join_matchmaking,leave_matchmaking,join_room,leave_room,record_match_result, get_current_match, start_tournament, register_player, create_tournament
)

urlpatterns = [
    path('join_matchmaking/<str:user_id>/', join_matchmaking, name='join_matchmaking'),
    path('leave_matchmaking/<str:user_id>/', leave_matchmaking, name='leave_matchmaking'),

    path('join_private_room/', join_room, name='join_private_room'),
    path('leave_private_room/', leave_room, name='leave_private_room'),
    
    path('create_tournament/', create_tournament, name='create_tournament'),
    path('register_player/', register_player, name='register_player'),
    path('start_tournament/', start_tournament, name='start_tournament'),
    path('get_current_match/', get_current_match, name='get_current_match'),
    path('record_match_result/', record_match_result, name='record_match_result'),
    path('list_tournaments/', list_tournaments, name='list_tournaments'),

]