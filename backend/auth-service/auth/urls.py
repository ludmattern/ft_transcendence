from django.urls import path
from service.views import  login_view, protected_view, check_auth_view, logout_view, verify_2fa_view


urlpatterns = [
    path('logindb/', login_view, name='logindb'),
    path('protected/', protected_view, name='protected_view'),
    path('check-auth/', check_auth_view, name='check_auth'),
    path('logout/', logout_view, name='logout'),
    path('verify-2fa/', verify_2fa_view, name='verify-2fa'),
]
