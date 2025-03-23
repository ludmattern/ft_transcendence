# tournament-service/urls.py
from django.urls import path  # type: ignore
from service.views import (
    create_local_tournament_view,
    get_current_tournament,
    update_match_result,
    abandon_local_tournament,
    getCurrentTournamentInformation,
    try_join_random_tournament,
    try_join_tournament_with_room_code,
)

urlpatterns = [
    path("get_current_tournament/", get_current_tournament, name="get_current_tournament"),
    path("update_match_result/", update_match_result, name="update_match_result"),
    path("abandon_local_tournament/", abandon_local_tournament, name="abandon_local_tournament"),
    path("create_local_tournament/", create_local_tournament_view, name="create_local_tournament"),
    path("getCurrentTournamentInformation/", getCurrentTournamentInformation, name="getCurrentTournamentInformation"),
    path("try_join_random_tournament/", try_join_random_tournament, name="try_join_random_tournament"),
    path("try_join_tournament_with_room_code/", try_join_tournament_with_room_code, name="try_join_tournament_with_room_code"),
]
