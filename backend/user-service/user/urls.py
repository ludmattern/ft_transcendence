from django.contrib import admin
from django.urls import path
from service.views import register_user, generate_qr_code, update_info


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('generate-qr/<str:username>/', generate_qr_code, name='generate_qr'),
    path('update/', update_info, name='update_info'),
]
