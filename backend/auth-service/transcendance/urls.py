from django.contrib import admin
from django.urls import path
from users.views import login_view, register_user, protected_view, check_auth_view


urlpatterns = [
    path('admin/', admin.site.urls),
    path('logindb/', login_view, name='logindb'),
    path('register/', register_user, name='register_user'),
    path('protected/', protected_view, name='protected_view'),
    path('check-auth/', check_auth_view, name='check_auth'),
]
