from django.urls import path  # type: ignore
from service.views import (
    get_leaderboard,
    search_pilots,
    get_user_id,
    upload_profile_picture,
    get_profile,
    get_game_history,
    getUsername,
    register_user,
    generate_qr_code,
    update_info,
    delete_account,
    check_oauth_id,
    update_alias,
)
from service.friends import get_relationship_status, get_friends
from service.profile import profile_info
from service.info import info_getter
from service.views_info_storage import (
    push_info_storage,
    get_info_storage,
    delete_info_storage,
)

urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("generate-qr/<str:username>/", generate_qr_code, name="generate_qr"),
    path("update/", update_info, name="update_info"),
    path("delete/", delete_account, name="delete_account"),
    path("profile/", profile_info, name="profile_info"),
    path("getUsername/", getUsername, name="getUsername"),
    path("info-getter/", info_getter, name="info_getter"),
    path("get-relationship-status/", get_relationship_status, name="get_relationship_status"),
    path("get_game_history/", get_game_history, name="get_game_history"),
    path("get_profile/", get_profile, name="get_profile"),
    path("upload_profile_picture/", upload_profile_picture, name="upload_profile_picture"),
    path("get_friends/", get_friends, name="get_friends"),
    path("get_user_id/<str:username>/", get_user_id, name="get_user_id"),
    path("search_pilots/", search_pilots, name="search_pilots"),
    path("leaderboard/", get_leaderboard, name="leaderboard"),
    path("storage/push/", push_info_storage, name="push_info_storage"),
    path("storage/get/", get_info_storage, name="get_info_storage"),
    path("storage/delete/", delete_info_storage, name="delete_info_storage"),
    path("check_oauth_id/", check_oauth_id, name="check_oauth_id"),
    path("update_alias/", update_alias, name="update_alias"),
]
