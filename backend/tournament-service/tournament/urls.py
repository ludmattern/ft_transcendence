from django.urls import path # type: ignore
from service.views import (
    create_local_tournament_view,
    get_current_tournament,
    update_match_result,
    abandon_local_tournament,
    getTournamentSerialKey,
    getTournamentParticipants,
    getTournamentIdFromSerialKey,
	isUserTournamentOrganizer,
	getStatusOfCurrentTournament,
	getParticipantStatusInTournament,
	getCurrentTournamentInformation,
    try_join_random_tournament,
    try_join_tournament_with_room_code,
)

urlpatterns = [
    path("get_current_tournament/", get_current_tournament, name="get_current_tournament"),
    path("update_match_result/", update_match_result, name="update_match_result"),
    path("getTournamentSerialKey/<int:user_id>/", getTournamentSerialKey, name="getTournamentSerialKey"),
    path("abandon_local_tournament/", abandon_local_tournament, name="abandon_local_tournament"),
    path('create_local_tournament/', create_local_tournament_view, name='create_local_tournament'),
    path('getTournamentParticipants/<int:tournament_id>/', getTournamentParticipants, name='getTournamentParticipants'),
    path('getTournamentIdFromSerialKey/<str:serial_key>/', getTournamentIdFromSerialKey, name='getTournamentIdFromSerialKey'),
	path('isUserTournamentOrganizer/<str:user_id>/<str:tournament_serial_key>/', isUserTournamentOrganizer, name='isUserTournamentOrganizer'),
	path('getStatusOfCurrentTournament/<str:user_id>/', getStatusOfCurrentTournament, name='getStatusOfCurrentTournament'),
	path('getParticipantStatusInTournament/', getParticipantStatusInTournament, name='getParticipantStatusInTournament'),
	path('getCurrentTournamentInformation/', getCurrentTournamentInformation, name='getCurrentTournamentInformation'),
    path("try_join_random_tournament/", try_join_random_tournament, name="try_join_random_tournament"),
    path("try_join_tournament_with_room_code/", try_join_tournament_with_room_code, name="try_join_tournament_with_room_code"),
]
