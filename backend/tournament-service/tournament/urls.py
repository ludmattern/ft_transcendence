from django.urls import path
from service.views import create_local_tournament_view, get_current_tournament, update_match_result, abandon_local_tournament, getTournamentSerialKey

urlpatterns = [
    path("get_current_tournament/", get_current_tournament, name="get_current_tournament"),
	path("update_match_result/", update_match_result, name="update_match_result"),
    path("getTournamentSerialKey/<int:user_id>/", getTournamentSerialKey, name="getTournamentSerialKey"),
    path("abandon_local_tournament/", abandon_local_tournament, name="abandon_local_tournament"),
    path('create_local_tournament/', create_local_tournament_view, name='create_local_tournament'),

]
