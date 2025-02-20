from django.urls import path
from service.views import get_current_tournament

urlpatterns = [
    path("get_current_tournament/", get_current_tournament, name="get_current_tournament"),
]
