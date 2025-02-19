# myapp/urls.py
from django.urls import path
from service.views import create_local_tournament

urlpatterns = [
    path('create-local-tournament/', create_local_tournament, name='create_local_tournament'),
]
