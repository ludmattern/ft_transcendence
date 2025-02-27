from django.contrib import admin
from django.urls import path
from service.views import get_leaderboard, search_pilots, get_user_id, upload_profile_picture, get_profile, get_game_history, getUsername, register_user, generate_qr_code, update_info, delete_account
from service.friends import is_friend, get_friends
from service.profile import profile_info
from service.info import info_getter

urlpatterns = [
	path('register/', register_user, name='register_user'),
	path('generate-qr/<str:username>/', generate_qr_code, name='generate_qr'),
	path('update/', update_info, name='update_info'),
	path('delete/', delete_account, name='delete_account'),
	path('profile/', profile_info, name='profile_info'),
	path('getUsername/', getUsername, name='getUsername'),
	path('info-getter/<int:user_id>/', info_getter, name='info_getter'),
	path('is-friend/', is_friend, name='is_friend'),
    path("get_game_history/", get_game_history, name="get_game_history"),
    path("get_profile/", get_profile, name="get_profile"),
    path("upload_profile_picture/", upload_profile_picture, name="upload_profile_picture"),
	path("get_friends/", get_friends, name="get_friends"),
    path("get_user_id/<str:username>/", get_user_id, name="get_user_id"),
    path("search_pilots/", search_pilots, name="search_pilots"),
    path("leaderboard/", get_leaderboard, name="leaderboard"),

]
