from django.urls import path  # type: ignore
from service.views import (
    get_42_auth_url,
    oauth_callback,
    get_user_id_from_cookie,
    login_view,
    protected_view,
    check_auth_view,
    logout_view,
    verify_2fa_view,
    request_password_reset,
    verify_reset_code,
    change_password
)

urlpatterns = [
    path("logindb/", login_view, name="logindb"),
    path("protected/", protected_view, name="protected_view"),
    path("check-auth/", check_auth_view, name="check_auth"),
    path("logout/", logout_view, name="logout"),
    path("verify-2fa/", verify_2fa_view, name="verify-2fa"),
    path("get_user_id_from_cookie/", get_user_id_from_cookie, name="get_user_id_from_cookie"),
    path("oauth/callback/", oauth_callback, name="oauth_callback"),
    path("get-42-url/", get_42_auth_url, name="get_42_auth_url"),
    path("request-password-reset/", request_password_reset, name="request_password_reset"),
    path("verify-reset-code/", verify_reset_code, name="verify_reset_code"),
    path("change-password/", change_password, name="change_password"),
]
