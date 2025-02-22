from django.urls import path
from service.views import get_current_tournament, update_match_result, abandon_local_tournament

urlpatterns = [
    path("get_current_tournament/", get_current_tournament, name="get_current_tournament"),
    path("update_match_result/", update_match_result, name="update_match_result"),
    path("abandon_local_tournament/", abandon_local_tournament, name="abandon_local_tournament"),


]
