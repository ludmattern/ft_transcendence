from django.urls import path
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
    abandon_online_tournament
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
	path('getParticipantStatusInTournament/<str:user_id>/', getParticipantStatusInTournament, name='getParticipantStatusInTournament'),
	path('getCurrentTournamentInformation/<str:user_id>/', getCurrentTournamentInformation, name='getCurrentTournamentInformation'),
    path("abandon_online_tournament/", abandon_online_tournament, name="abandon_online_tournament"),

]
