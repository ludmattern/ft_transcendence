import json
import bcrypt
import datetime
from datetime import timedelta
import random
import jwt
import pyotp  # type: ignore
import os
import base64
from functools import wraps


from cryptography.fernet import Fernet
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse  # type: ignore
from django.conf import settings  # type: ignore
from django.core.mail import send_mail  # type: ignore
from django.utils.timezone import now, is_aware, make_aware  # type: ignore
from django.shortcuts import redirect, render  # type: ignore
from django.core.signing import Signer


import requests
from urllib.parse import urlencode

from twilio.rest import Client  # type: ignore

from service.models import ManualUser

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import logging

logger = logging.getLogger(__name__)
cipher = Fernet(settings.FERNET_KEY)


def decrypt_thing(encrypted_text):
    return cipher.decrypt(encrypted_text.encode("utf-8")).decode("utf-8")


def generate_session_token(user):
    """ganerate a JWT token for the user."""
    current_time = datetime.datetime.utcnow()
    expiry = current_time + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
    token = jwt.encode(
        {"sub": str(user.id), "iat": current_time, "exp": expiry.timestamp()},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    token_str = token if isinstance(token, str) else token.decode("utf-8")
    return token_str, expiry


def set_access_token_cookie(response, token_str):
    response.set_cookie(key="access_token", value=token_str, httponly=True, secure=True, samesite="Strict", max_age=settings.JWT_EXP_DELTA_SECONDS)


@require_GET
def check_auth_view(request):
    """verify the validity of the access token."""
    token = request.COOKIES.get("access_token")
    if not token:
        return JsonResponse({"success": False, "message": "Cookie missing"}, status=200)
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        current_timestamp = datetime.datetime.utcnow().timestamp()
        if "exp" not in payload or "sub" not in payload:
            return JsonResponse({"success": False, "message": "Invalid token payload"}, status=200)

        try:
            user = ManualUser.objects.get(id=int(payload["sub"]))
        except ManualUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "Invalid credentials"}, status=200)

        if user.session_token != token:
            return JsonResponse({"success": False, "message": "Token does not match active session"}, status=200)

        if not user.token_expiry or user.token_expiry.timestamp() < current_timestamp:
            return JsonResponse({"success": False, "message": "Token expired (DB)"}, status=200)

        remaining = payload["exp"] - current_timestamp
        if remaining < 1000:
            new_token, new_expiry = generate_session_token(user)
            user.token_expiry = new_expiry
            user.session_token = new_token
            user.save()

            response = JsonResponse({"success": True, "id": user.id, "username": user.username, "message": "Cookie renewed"})
            set_access_token_cookie(response, new_token)
            return response

        return JsonResponse({"success": True, "id": user.id, "username": user.username, "message": "Cookie still valid"})
    except jwt.ExpiredSignatureError:
        return JsonResponse({"success": False, "message": "Token expired"}, status=401)
    except jwt.InvalidTokenError as e:
        logging.error("Invalid token: %s", e)
        return JsonResponse({"success": False, "message": "Token error"}, status=200)
    except Exception as e:
        logging.error("Unexpected error: %s", e)
        return JsonResponse({"success": False, "message": "Unexpected error"}, status=500)


def jwt_required(view_func):
    """Decorator to require a valid JWT token."""

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.COOKIES.get("access_token")
        if not token:
            return JsonResponse({"success": False, "message": "No access_token cookie"}, status=401)

        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                return JsonResponse({"success": False, "message": "Invalid token: no sub"}, status=401)

            try:
                user = ManualUser.objects.get(pk=user_id)
            except ManualUser.DoesNotExist:
                return JsonResponse({"success": False, "message": "User not found"}, status=200)

            if user.session_token != token:
                return JsonResponse({"success": False, "message": "Invalid or outdated token"}, status=401)

            if not user.token_expiry or user.token_expiry < datetime.datetime.utcnow():
                return JsonResponse({"success": False, "message": "Token expired in DB"}, status=401)

            request.user = user
        except jwt.ExpiredSignatureError:
            return JsonResponse({"success": False, "message": "Token expired"}, status=401)
        except jwt.InvalidTokenError as e:
            logging.error("Invalid token: %s", e)
            return JsonResponse({"success": False, "message": "Token error"}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper


def generate_2fa_code(length=6):
    """Génère un code numérique à 6 chiffres."""
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def send_2fa_email(recipient, code):
    subject = "Your 2FA Code"
    message = f"Hello,\nHere is your 2FA code: {code}\nRegards."
    send_mail(subject, message, None, [decrypt_thing(recipient)], fail_silently=False)


def send_2fa_sms(phone_number, code):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        message = client.messages.create(body=f"Your 2FA code is: {code}", from_=settings.TWILIO_PHONE_NUMBER, to=decrypt_thing(phone_number))
        logger.info("SMS sent, SID: %s", message.sid)
    except Exception as e:
        logger.error("Error sending SMS: %s", e)

@require_POST
def login_view(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        username = body.get("username")
        password = body.get("password")

        if not username or not password:
            return JsonResponse({"success": False, "message": "Username and password are required."}, status=400)

        user = ManualUser.objects.get(username=username)
        

        now_utc = datetime.datetime.utcnow()

        if not user.password:
           return JsonResponse({"success": False, "message": "This account does not support password login"}, status=400)

        if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
            return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

        if user.is_2fa_enabled:
            code = generate_2fa_code()
            hashed_code = bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            user.temp_2fa_code = hashed_code
            user.reset_2fa_expiry = now_utc + timedelta(minutes=2)
            user.save()
            if user.twofa_method == "email":
                send_2fa_email(user.email, code)
            elif user.twofa_method == "sms":
                send_2fa_sms(user.phone_number, code)
            return JsonResponse({"success": True, "message": "2FA required", "twofa_method": user.twofa_method}, status=200)

        cookie_token = request.COOKIES.get("access_token")

        if user.token_expiry and user.token_expiry > now_utc:
            if not cookie_token or cookie_token != user.session_token:
                user.token_expiry = None
                user.session_token = None
                user.save()
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{user.id}", {"type": "logout", "message": "session replaced"}
                )
            else:
                return JsonResponse({"success": False, "message": "User is already connected"}, status=403)
        else:
            logger.info(f"User {user.id}: no active session or token expired")

        token_str, expiry = generate_session_token(user)
        user.token_expiry = expiry
        user.session_token = token_str
        user.status = "online"
        user.save()

        response = JsonResponse({"success": True, "message": "Logged in", "id": user.id, "username": user.username})
        set_access_token_cookie(response, token_str)
        return response

    except ManualUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        logger.exception(f"Unexpected error during login: {e}")
        return JsonResponse({"success": False, "message": "Internal server error"}, status=500)

@require_POST
@jwt_required
def logout_view(request):
    """POST /logout/"""
    token = request.COOKIES.get("access_token")
    if not token:
        return JsonResponse({"success": False, "message": "No token provided"}, status=400)

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user = ManualUser.objects.get(id=payload.get("sub"))
        user.token_expiry = None
        user.status = "offline"
        user.save()

        response = JsonResponse({"success": True, "message": "Logged out"})
        response.delete_cookie("access_token")
        return response

    except jwt.ExpiredSignatureError:
        return JsonResponse({"success": False, "message": "Token already expired"}, status=401)

    except (jwt.InvalidTokenError, ManualUser.DoesNotExist) as e:
        logging.error("Error during logout: %s", e)
        return JsonResponse({"success": False, "message": "Unexpected error"}, status=401)

    except Exception as e:
        logging.exception("Unhandled error during logout: %s", e)
        return JsonResponse({"success": False, "message": "Internal server error"}, status=500)


@require_POST
def verify_2fa_view(request):
    """POST /verify-2fa/"""
    try:
        body = json.loads(request.body.decode("utf-8"))
        username = body.get("username")
        code = body.get("twofa_code")
        if not username or not code:
            return JsonResponse({"success": False, "message": "Username and 2FA code are required"}, status=400)

        try:
            user = ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)

        cookie_token = request.COOKIES.get("access_token")
        now_utc = datetime.datetime.utcnow()
        if user.token_expiry and user.token_expiry > now_utc:
            if not cookie_token or cookie_token != user.session_token:
                user.token_expiry = None
                user.session_token = None
                user.save()
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(f"user_{user.id}", {"type": "logout", "message": "session replaced"})
            else:
                return JsonResponse({"success": False, "message": "User is already connected"}, status=403)

        if user.twofa_method == "authenticator-app":
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                token_str, expiry = generate_session_token(user)
                user.token_expiry = expiry
                user.session_token = token_str
                user.status = "online"
                user.save()
                response = JsonResponse({"success": True, "message": "2FA verified"})
                set_access_token_cookie(response, token_str)
                return response
            else:
                return JsonResponse({"success": False, "message": "Invalid 2FA code"}, status=401)
        elif bcrypt.checkpw(code.encode("utf-8"), user.temp_2fa_code.encode("utf-8")):
            if datetime.datetime.utcnow() > user.reset_2fa_expiry:
                return JsonResponse({"success": False, "message": "Invalid 2FA code"}, status=401)
            token_str, expiry = generate_session_token(user)
            user.token_expiry = expiry
            user.session_token = token_str
            user.status = "online"
            user.save()
            response = JsonResponse({"success": True, "message": "2FA verified"})
            set_access_token_cookie(response, token_str)
            return response
        else:
            return JsonResponse({"success": False, "message": "Invalid 2FA code"}, status=401)
    except Exception as e:
        logging.exception("Unexpected error during 2FA verification: %s", e)
        return JsonResponse({"success": False, "message": "Internal server error"}, status=500)

@require_GET
def get_user_id_from_cookie(request):
    """GET /get-user-id/"""
    token = request.COOKIES.get("access_token")
    if not token:
        return JsonResponse({"error": "access_token cookie not found"}, status=400)

    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = decoded.get("sub") or decoded.get("user_id")
        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)

        return JsonResponse({"success": True, "user_id": user_id})
    except Exception as e:
        return JsonResponse({"Internal server error"}, status=400)


def generate_state():
    return base64.urlsafe_b64encode(os.urandom(16)).decode()


SERVER_IP = settings.HOSTNAME
REDIRECT_URI = f"https://{SERVER_IP}:8443/api/auth-service/oauth/callback/"
CLIENT_ID = settings.UID_42
CLIENT_SECRET = settings.SECRET_42
OAUTH_HOSTNAME = settings.OAUTH_HOSTNAME


@require_GET
def get_42_auth_url(request):
    state = generate_state()
    logger.info(f"Generated state: {state}")
    signer = Signer()
    signed_state = signer.sign(state)
    logger.info(f"Signed state: {signed_state}")

    auth_url = f"https://{OAUTH_HOSTNAME}/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=public&state={state}"

    logger.info(f"Redirecting to: {auth_url}")
    response = JsonResponse({"url": auth_url})
    logger.info(f"Setting state cookie: {signed_state}")
    response.set_cookie("oauth_state", signed_state, httponly=True, secure=True, samesite="Lax")

    return response


@require_GET
def oauth_callback(request):
    error = request.GET.get("error")
    if error:
        return redirect(f"https://{SERVER_IP}:8443/login")

    state_returned = request.GET.get("state")
    signed_state = request.COOKIES.get("oauth_state")
    if not signed_state:
        return JsonResponse({"success": False, "message": "Missing state cookie"}, status=400)

    signer = Signer()
    try:
        unsigned_state = signer.unsign(signed_state)
    except Exception:
        return JsonResponse({"success": False, "message": "Invalid state cookie"}, status=400)

    if not state_returned or state_returned != unsigned_state:
        return JsonResponse({"success": False, "message": "Invalid state parameter"}, status=400)

    code = request.GET.get("code")
    if not code:
        return JsonResponse({"success": False, "message": "No code provided"}, status=400)

    token_url = f"https://{OAUTH_HOSTNAME}/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        token_response = requests.post(token_url, data=urlencode(token_data), headers=headers)
        token_response_data = token_response.json()
        if "access_token" not in token_response_data:
            return JsonResponse({"success": False, "message": "Failed to get access token"}, status=400)

        access_token = token_response_data["access_token"]
        user_info_url = f"https://{OAUTH_HOSTNAME}/v2/me"
        user_response = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"})
        user_data = user_response.json()
        username = user_data.get("login")
        oauth_id = user_data.get("id")
        if not username or not oauth_id:
            return JsonResponse({"success": False, "message": "Invalid user data from 42"}, status=400)

        user = ManualUser.objects.filter(oauth_id=oauth_id).first()
        if not user:
            original_username = username
            counter = 1
            while ManualUser.objects.filter(username=username).exists():
                username = f"{original_username}_{counter}"
                counter += 1
            user = ManualUser.objects.create(
                username=username,
                oauth_id=oauth_id,
                password=None,
                is_2fa_enabled=False,
                twofa_method=None,
                phone_number=None,
                is_dummy=False,
            )

        token_str, expiry = generate_session_token(user)
        user.token_expiry = expiry
        user.session_token = token_str
        user.status = "online"
        user.save()

        response = render(request, "authenticating.html", {"token_str": token_str})
        set_access_token_cookie(response, token_str)
        response.delete_cookie("oauth_state")
        return response
    except Exception:
        logger.exception("OAuth callback error")
        return JsonResponse({"success": False, "message": "Internal Server Error"}, status=500)


@require_POST
def request_password_reset(request):
    """POST /request-password-reset/"""
    try:
        body = json.loads(request.body.decode("utf-8"))
        email = body.get("email")
        if not email:
            return JsonResponse({"success": False, "message": "Email is required"}, status=400)

        user = None
        for u in ManualUser.objects.filter(email__isnull=False).exclude(email=""):
            try:
                if decrypt_thing(u.email) == email:
                    user = u
                    break
            except Exception:
                continue
        if not user:
            return JsonResponse({"success": False, "message": "User not found"})

        current_time = now()
        if user.reset_code_expiry and user.reset_code_expiry > current_time:
            remaining = (user.reset_code_expiry - current_time).total_seconds()
            return JsonResponse({"success": False, "message": f"Please wait {int(remaining)} seconds before requesting a new code"}, status=429)

        code = generate_2fa_code()
        hashed_code = bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user.temp_reset_code = hashed_code
        user.reset_code_expiry = current_time + datetime.timedelta(minutes=1)
        user.save()

        subject = "Password Reset Code"
        message = f"Hi,\n\nHere is your reset code : {code}\n\nHave a good day."
        send_mail(subject, message, None, [email], fail_silently=False)

        return JsonResponse({"success": True, "message": "Reset code sent"})
    except Exception as e:
        logging.error("An error occurred while requesting a password reset: %s", str(e))
        return JsonResponse({"success": False, "message": "Internal Server Error"}, status=500)


@require_POST
def verify_reset_code(request):
    logger.info("Verifying reset code")
    try:
        body = json.loads(request.body.decode("utf-8"))
        email = body.get("email")
        code = body.get("code")
        if not email or not code:
            return JsonResponse({"success": False, "message": "Missing email or code"}, status=400)

        user = None
        for u in ManualUser.objects.filter(email__isnull=False).exclude(email=""):
            try:
                if decrypt_thing(u.email) == email:
                    user = u
                    break
            except Exception:
                continue
        if not user:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)

        current_time = now()
        reset_expiry = make_aware(user.reset_code_expiry) if user.reset_code_expiry and not is_aware(user.reset_code_expiry) else user.reset_code_expiry

        if not reset_expiry or reset_expiry < current_time:
            return JsonResponse({"success": False, "message": "Reset code expired"}, status=400)
        if not user.temp_reset_code:
            return JsonResponse({"success": False, "message": "No reset code found"}, status=400)
        if not bcrypt.checkpw(code.encode("utf-8"), user.temp_reset_code.encode("utf-8")):
            return JsonResponse({"success": False, "message": "Invalid code"}, status=401)

        reset_token = jwt.encode(
            {
                "sub": str(user.id),
                "iat": current_time.timestamp(),
                "exp": (current_time + datetime.timedelta(minutes=1)).timestamp(),
                "type": "password_reset",
            },
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
        reset_token_str = reset_token if isinstance(reset_token, str) else reset_token.decode("utf-8")
        return JsonResponse({"success": True, "message": "Code verified", "reset_token": reset_token_str})
    except ManualUser.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        logger.error("An error occurred while verifying the reset code: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)


@require_POST
def change_password(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        new_password = body.get("new_password")
        reset_token = body.get("reset_token")
        if not new_password or not reset_token:
            return JsonResponse({"success": False, "message": "Missing new_password or reset_token"}, status=400)

        try:
            payload = jwt.decode(reset_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"success": False, "message": "Reset token expired"}, status=401)
        except jwt.InvalidTokenError as e:
            logging.error("Invalid reset token: %s", e)
            return JsonResponse({"success": False, "message": "Token error"}, status=401)

        if payload.get("type") != "password_reset":
            return JsonResponse({"success": False, "message": "Invalid token type"}, status=401)

        user_id = payload.get("sub")
        user = ManualUser.objects.get(id=int(user_id))

        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user.password = hashed_password
        user.temp_reset_code = None
        user.reset_code_expiry = None
        user.save()

        return JsonResponse({"success": True, "message": "Password changed successfully"})
    except ManualUser.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        logger.error("An error occurred while changing the password: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)
