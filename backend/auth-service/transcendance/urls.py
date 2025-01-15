from django.contrib import admin
from django.urls import path
from users.views import generate_qr_code, login_view, register_user, protected_view, check_auth_view, logout_view, verify_2fa_view


urlpatterns = [
    path('admin/', admin.site.urls),
    path('logindb/', login_view, name='logindb'),
    path('register/', register_user, name='register_user'),
    path('protected/', protected_view, name='protected_view'),
    path('check-auth/', check_auth_view, name='check_auth'),
    path('logout/', logout_view, name='logout'),
    path('verify-2fa/', verify_2fa_view, name='verify-2fa'),
    path('generate-qr/<str:username>/', generate_qr_code, name='generate_qr'),
]
