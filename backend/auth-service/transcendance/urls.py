from django.contrib import admin
from django.urls import path
from users.views import login_view
from users.views import register_user

urlpatterns = [
    path('admin/', admin.site.urls),
    path('logindb/', login_view, name='logindb'),
    path('register/', register_user, name='register_user'),
]
