import json
import bcrypt
import os
import jwt
import pyotp  # type: ignore
import qrcode  # type: ignore
import re

import logging

from io import BytesIO
from functools import wraps
from PIL import Image  # type: ignore
from cryptography.fernet import Fernet
from django.http import JsonResponse, HttpResponse  # type: ignore
from django.views.decorators.http import require_POST, require_GET



from django.db.models import Q  # type: ignore
from django.db.models.functions import Length  # type: ignore
from django.conf import settings  # type: ignore
from django.utils.timezone import now, is_aware, make_aware  # type: ignore
from .models import ManualUser, ManualGameHistory, ManualBlockedRelations

cipher = Fernet(settings.FERNET_KEY)


def is_expired(expiry):

    if expiry is None:
        return True
    if not is_aware(expiry):
        expiry = make_aware(expiry)
    return expiry < now()


def decrypt_thing(encrypted_args):
    return cipher.decrypt(encrypted_args.encode("utf-8")).decode("utf-8")


def encrypt_thing(text):
    return cipher.encrypt(text.encode("utf-8")).decode("utf-8")


def jwt_required(view_func):
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
                return JsonResponse({"success": False, "message": "User not found"}, status=404)

            if user.session_token != token:
                return JsonResponse({"success": False, "message": "Invalid or outdated token"}, status=401)

            if is_expired(user.token_expiry):
                return JsonResponse({"success": False, "message": "Token expired in DB"}, status=401)

            request.user = user

        except jwt.ExpiredSignatureError:
            return JsonResponse({"success": False, "message": "Token expired"}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({"success": False, "message": "Internal server error"}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper


def generate_qr_code(request, username):
    try:
        user = ManualUser.objects.get(username=username)
        totp = pyotp.TOTP(user.totp_secret)
        uri = totp.provisioning_uri(name=username, issuer_name="ft_transcendence")
        qr = qrcode.make(uri)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")
    except ManualUser.DoesNotExist:
        return HttpResponse("User not found", status=404)


def validate_username(username):
    if len(username) < 6 or len(username) > 20:
        return "Username must be between 6 and 20 characters"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return "Username can only contain alphanumeric characters and underscores"
    if ManualUser.objects.filter(username=username).exists():
        return "Username already taken"
    return None


def validate_email(email):
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, email):
        return "Invalid email format"
    if len(email) > 50:
        return "Email must be less than 50 characters"
    encrypted_email = encrypt_thing(email)
    existing_users = ManualUser.objects.filter(is_dummy=False, email__isnull=False).exclude(email="")
    for user in existing_users:
        try:
            if decrypt_thing(user.email) == email:
                return "Email already in use"
        except Exception:
            return "Email decryption failed"
    return encrypted_email


def validate_password(password):
    if len(password) < 6 or len(password) > 20:
        return "Password must be between 6 and 20 characters"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one digit"
    if not re.search(r"[@$+!%*-.?&#^]", password):
        return "Password must contain at least one special character"
    return None


@require_POST
def register_user(request):
    body = json.loads(request.body.decode("utf-8"))
    username = body.get("username")
    email = body.get("email")
    password = body.get("password")
    is_2fa_enabled = body.get("is_2fa_enabled", False)
    twofa_method = body.get("twofa_method", None)
    phone_number = body.get("phone_number", None)
    try:
        if not username or not email or not password:
            logging.error("Missing required fields")
            return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)

        username_error = validate_username(username)
        if username_error:
            logging.error("Username error: %s", username_error)
            return JsonResponse({"success": False, "message": username_error}, status=400)

        email_error_or_encrypted = validate_email(email)
        if email_error_or_encrypted == "Email decryption failed" or  email_error_or_encrypted == "Email already in use" or email_error_or_encrypted == "Email must be less than 50 characters" or email_error_or_encrypted == "Invalid email format":
            logging.error("Email error: %s", email_error_or_encrypted)
            return JsonResponse({"success": False, "message": email_error_or_encrypted}, status=400)
        encrypted_email = email_error_or_encrypted

        if is_2fa_enabled and twofa_method == "sms" and not phone_number:
            logging.error("Phone number is required for SMS 2FA")
            return JsonResponse({"success": False, "message": "Phone number is required for SMS 2FA"}, status=400)

        password_error = validate_password(password)
        if password_error:
            logging.error("Password validation failed")
            return JsonResponse({"success": False, "message": password_error}, status=400)

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        encrypted_phone = encrypt_thing(phone_number) if phone_number else None

        user = ManualUser.objects.create(
            username=username,
            email=encrypted_email,
            password=hashed_password,
            is_2fa_enabled=is_2fa_enabled,
            twofa_method=twofa_method,
            phone_number=encrypted_phone,
            is_dummy=False,
        )

        return JsonResponse({"success": True, "message": "User registered successfully", "user_id": user.id}, status=201)
    except Exception as e:
        logging.error("Error in register_user: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)


@require_POST
@jwt_required
def delete_account(request):
    try:
        user = request.user
        if not user:
            return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)
        user_id = user.id
        username = user.username
        user.delete()
        return JsonResponse({"success": True, "message": f"User {username} deleted successfully", "user_id": user_id})
    except Exception as e:
        logging.error("Error in delete_account: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)


@require_POST
@jwt_required
def update_info(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        old_password = body.get("oldPassword", "")
        new_username = body.get("newUsername", "").strip()
        new_password = body.get("newPassword", "").strip()
        confirm_password = body.get("confirmPassword", "").strip()
        new_email = body.get("newEmail", "").strip()
        confirm_email = body.get("confirmEmail", "").strip()

        user = request.user
        if not user:
            return JsonResponse({"success": False, "message": "Unauthorized"}, status=401)

        if not old_password:
            return JsonResponse({"success": False, "message": "Please enter current password"}, status=401)

        if not bcrypt.checkpw(old_password.encode("utf-8"), user.password.encode("utf-8")):
            return JsonResponse({"success": False, "message": "Current password is incorrect"}, status=402)

        if not any([new_username, new_email, new_password]):
            return JsonResponse({"success": False, "message": "No changes to update"}, status=400)

        if new_username:
            if ManualUser.objects.filter(username=new_username).exists():
                return JsonResponse({"success": False, "message": "Username already taken"}, status=409)
            new_username_error = validate_username(new_username)
            if new_username_error:
                return JsonResponse({"success": False, "message": new_username_error}, status=400)
            user.username = new_username

        if new_email:
            if new_email != confirm_email:
                return JsonResponse({"success": False, "message": "Emails do not match"}, status=400)
            decrypted_email = decrypt_thing(user.email)
            if new_email == decrypted_email:
                return JsonResponse({"success": False, "message": "You're already using this email"}, status=400)
            else:
                if ManualUser.objects.exclude(id=user.id).filter(email=encrypt_thing(new_email)).exists():
                    return JsonResponse({"success": False, "message": "Email already in use"}, status=409)
                new_email_error_or_encrypted = validate_email(new_email)
                if new_email_error_or_encrypted == "Email decryption failed" or  new_email_error_or_encrypted == "Email already in use" or new_email_error_or_encrypted == "Email must be less than 50 characters" or new_email_error_or_encrypted == "Invalid email format":
                    logging.error("Email error: %s", new_email_error_or_encrypted)
                    return JsonResponse({"success": False, "message": new_email_error_or_encrypted}, status=400)
                
            user.email = encrypt_thing(new_email)

        if new_password == old_password:
            return JsonResponse({"success": False, "message": "New password cannot be the same as old password"}, status=400)

        if new_password:
            if new_password != confirm_password:
                return JsonResponse({"success": False, "message": "Passwords do not match"}, status=400)
            new_password_error = validate_password(new_password)
            if new_password_error:
                return JsonResponse({"success": False, "message": new_password_error}, status=400)
            user.password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user.save()
        return JsonResponse({"success": True, "message": "Information updated successfully"})
    except Exception as e:
        logging.error("Error in update_info: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)

@jwt_required
@require_POST
def getUsername(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
        user_id = body.get("id")
        if not user_id:
            return JsonResponse({"success": False, "message": "User ID is required"}, status=400)
        user = ManualUser.objects.get(id=user_id)
        return JsonResponse({"success": True, "username": user.username})
    except ManualUser.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found"}, status=404)
    except Exception as e:
        logging.error("Error in getUsername: %s", str(e))
        return JsonResponse({"success": False, "message": "An internal error has occurred!"}, status=500)

@jwt_required
@require_GET
def get_user_id(request, username):
    try:
        user = ManualUser.objects.get(username=username)
        return JsonResponse({"success": True, "user_id": str(user.id)})
    except ManualUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

@jwt_required
@require_GET
def get_game_history(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id parameter is required"}, status=400)
    try:
        history_entries = ManualGameHistory.objects.filter(Q(winner_id=user_id) | Q(loser_id=user_id)).order_by("-created_at")[:20]
        history_list = []
        wins = 0
        total_games = history_entries.count()
        for entry in history_entries:
            try:
                winner_user = ManualUser.objects.get(id=entry.winner_id)
                winner_username = winner_user.username
            except ManualUser.DoesNotExist:
                winner_username = None
            try:
                loser_user = ManualUser.objects.get(id=entry.loser_id)
                loser_username = loser_user.username
            except ManualUser.DoesNotExist:
                loser_username = None
            if str(entry.winner_id) == user_id:
                wins += 1
            history_list.append(
                {
                    "winner_id": entry.winner_id,
                    "winner_username": winner_username,
                    "loser_id": entry.loser_id,
                    "loser_username": loser_username,
                    "winner_score": entry.winner_score,
                    "loser_score": entry.loser_score,
                    "created_at": entry.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        winrate = (wins / total_games * 100) if total_games > 0 else 0
        return JsonResponse({"success": True, "history": history_list, "winrate": winrate})
    except Exception as e:
        logging.error("An error occurred in get_game_history: %s", str(e))
        return JsonResponse({"error": "An internal error has occurred!"}, status=500)

@jwt_required
@require_GET
def get_profile(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id parameter is required"}, status=400)
    try:
        user = ManualUser.objects.get(id=user_id)
        profile_picture = user.profile_picture.url
        data = {
            "username": user.username,
            "email": user.email,
            "profile_picture": profile_picture,
            "is_connected": user.is_connected,
            "elo": user.elo,
        }
        return JsonResponse({"success": True, "profile": data})
    except ManualUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        logging.error("An error occurred in get_profile: %s", str(e))
        return JsonResponse({"error": "An internal error has occurred!"}, status=500)


ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]
MAX_FILE_SIZE = 2 * 1024 * 1024


@require_POST
@jwt_required
def upload_profile_picture(request):
    try:
        user = request.user
        if not user:
            return JsonResponse({"success": False, "error": "Unauthorized"}, status=200)
        if "profile_picture" not in request.FILES:
            return JsonResponse({"success": False, "error": "No file uploaded"}, status=200)
        file = request.FILES["profile_picture"]
        if file.size > MAX_FILE_SIZE:
            return JsonResponse({"success": False, "error": "File too large"}, status=200)
        ext = os.path.splitext(file.name)[1].lower().strip(".")
        if ext not in ALLOWED_EXTENSIONS:
            return JsonResponse({"success": False, "error": "Invalid file format"}, status=200)
        try:
            image = Image.open(file)
            image.verify()
        except Exception:
            return JsonResponse({"success": False, "error": "Uploaded file is not a valid image"}, status=200)
        old_image_path = user.profile_picture.path if user.profile_picture else None
        user.profile_picture = file
        user.save()
        default_filename = "default-profile-150.png"
        if old_image_path and os.path.exists(old_image_path):
            if os.path.basename(old_image_path) != default_filename:
                try:
                    os.remove(old_image_path)
                except Exception:
                    return JsonResponse({"success": False, "error": "Failed to remove old image"}, status=500)
        return JsonResponse({"success": True, "profile_picture": user.profile_picture.url}, status=200)
    except Exception as e:
        logging.error("An error occurred in upload_profile_picture: %s", str(e))
        return JsonResponse({"error": "An internal error has occurred!"}, status=500)


@require_GET
@jwt_required
def search_pilots(request):
    query = request.GET.get("query")
    if not query:
        return JsonResponse({"message": "Query parameter is required"}, status=400)
    try:
        user = request.user
        blocked_users = ManualBlockedRelations.objects.filter(blocked_user=user).values_list("user_id", flat=True)
        pilots = ManualUser.objects.filter(username__icontains=query).exclude(id__in=blocked_users).exclude(id=user.id).annotate(
            username_length=Length('username')
        ).order_by('username_length', 'username')
        results = [{"username": pilot.username, "user_id": pilot.id, "is_connected": pilot.is_connected} for pilot in pilots]
        return JsonResponse({"success": True, "pilots": results}, status=200)

    except Exception as e:
        logging.error("An error occurred in search_pilots: %s", str(e))
        return JsonResponse({"error": "An internal error has occurred!"}, status=500)

@jwt_required
@require_GET
def get_leaderboard(request):
    players = ManualUser.objects.filter(elo__gt=0).order_by("-elo")[:500]
    results = [{"rank": index + 1, "username": player.username, "elo": player.elo} for index, player in enumerate(players)]
    return JsonResponse({"success": True, "players": results})


@jwt_required
def check_oauth_id(request):
    try:
        user = request.user
        return JsonResponse({"oauth_null": user.oauth_id is None}, status=200)

    except Exception as e:
        logging.error("An error occurred in check_oauth_id: %s", str(e))
        return JsonResponse({"success": False, "error": "An internal error has occurred!"}, status=500)

