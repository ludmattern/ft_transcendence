from django.contrib import admin
from django.urls import path
from users.views import register_user, generate_qr_code


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('generate-qr/<str:username>/', generate_qr_code, name='generate_qr'),

]
