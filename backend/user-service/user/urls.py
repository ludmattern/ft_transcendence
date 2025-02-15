from django.contrib import admin
from django.urls import path
from service.views import register_user, generate_qr_code, update_info, delete_account
from service.friends import accept_friend_request, send_friend_request, reject_friend_request, remove_friend
from service.blocked import block_user, unblock_user
from service.profile import profile_info


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('generate-qr/<str:username>/', generate_qr_code, name='generate_qr'),
    path('update/', update_info, name='update_info'),
    path('delete/', delete_account, name='delete_account'),
    path('profile/', profile_info, name='profile_info'),
    path('block/', block_user, name='block_user'),
    path('unblock/', unblock_user, name='unblock_user'),
    path('accept-friend/', accept_friend_request, name='accept_friend'),
    path('send-friend-request/', send_friend_request, name='send_friend_request'),
    path('reject-friend-request/', reject_friend_request, name='reject_friend_request'),
    path('remove-friend/', remove_friend, name='remove_friend')
]
