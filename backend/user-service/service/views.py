import json
import bcrypt
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ManualUser, GameHistory
from django.db.models import Q
import os

from cryptography.fernet import Fernet
import pyotp
import qrcode
from io import BytesIO
from django.conf import settings

cipher = Fernet(settings.FERNET_KEY)


def decrypt_thing(encrypted_args):
    """Decrypts the args."""
    return cipher.decrypt(encrypted_args.encode("utf-8")).decode("utf-8")


def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode("utf-8")).decode("utf-8")


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


@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            username = body.get("username")
            email = body.get("email")
            password = body.get("password")
            is_2fa_enabled = body.get("is_2fa_enabled", False)
            twofa_method = body.get("twofa_method", None)
            phone_number = body.get("phone_number", None)

            if not username or not email or not password:
                return JsonResponse(
                    {"success": False, "message": "Missing required fields"}, status=400
                )

            if ManualUser.objects.filter(username=username).exists():
                return JsonResponse(
                    {"success": False, "message": "Username already taken"}, status=409
                )

            encrypted_email = encrypt_thing(email)

            existing_users = ManualUser.objects.filter(
                is_dummy=False, email__isnull=False
            ).exclude(email="")

            for user in existing_users:
                try:
                    decrypted_email = decrypt_thing(user.email)
                    if decrypted_email == email:
                        return JsonResponse(
                            {"success": False, "message": "Email already in use"},
                            status=409,
                        )
                except Exception as e:
                    return JsonResponse(
                        {"success": False, "message": "email fail"}, status=409
                    )

            if is_2fa_enabled and twofa_method == "sms" and not phone_number:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Phone number is required for SMS 2FA",
                    },
                    status=400,
                )

            hashed_password = bcrypt.hashpw(
                password.encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8")
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

            return JsonResponse(
                {
                    "success": True,
                    "message": "User registered successfully",
                    "user_id": user.id,
                }
            )

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)
    else:
        return JsonResponse(
            {"success": False, "message": "Only POST method is allowed"}, status=405
        )


@csrf_exempt
def delete_account(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            username = body.get("username")

            user = ManualUser.objects.get(username=username)

            user.delete()

            return JsonResponse(
                {
                    "success": True,
                    "message": "User registered successfully",
                    "user_id": user.id,
                }
            )

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)
    else:
        return JsonResponse(
            {"success": False, "message": "Only POST method is allowed"}, status=405
        )


@csrf_exempt
def update_info(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            username = body.get("username")
            old_password = body.get("oldPassword")
            new_username = body.get("newUsername")
            new_password = body.get("newPassword")
            confirm_password = body.get("confirmPassword")
            new_email = body.get("newEmail")
            confirm_email = body.get("confirmEmail")

            user = ManualUser.objects.get(username=username)

            if old_password == "":
                return JsonResponse(
                    {"success": False, "message": "Please enter current password"},
                    status=401,
                )

            if not bcrypt.checkpw(
                old_password.encode("utf-8"), user.password.encode("utf-8")
            ):
                return JsonResponse(
                    {"success": False, "message": "Current password is incorrect"},
                    status=402,
                )

            if new_username == "" and new_email == "" and new_password == "":
                return JsonResponse(
                    {"success": False, "message": "No changes to update"}, status=400
                )

            if (
                new_username
                and ManualUser.objects.filter(username=new_username).exists()
            ):
                return JsonResponse(
                    {"success": False, "message": "Username already taken"}, status=409
                )
            if new_username:
                user.username = new_username

            if new_email:
                if new_email != confirm_email:
                    return JsonResponse(
                        {"success": False, "message": "Emails do not match"}, status=400
                    )
                if new_email != decrypt_thing(user.email):
                    existing_users = ManualUser.objects.all()
                    for user in existing_users:
                        decrypted_email = decrypt_thing(user.email)
                        if decrypted_email == new_email:
                            return JsonResponse(
                                {"success": False, "message": "Email already in use"},
                                status=409,
                            )
                encrypted_email = encrypt_thing(new_email)
                user.email = encrypted_email

            if new_password:
                if new_password != confirm_password:
                    return JsonResponse(
                        {"success": False, "message": "Passwords do not match"},
                        status=400,
                    )
                hashed_password = bcrypt.hashpw(
                    new_password.encode("utf-8"), bcrypt.gensalt()
                ).decode("utf-8")
                user.password = hashed_password

            user.save()

            return JsonResponse(
                {"success": True, "message": "Information updated successfully"}
            )

        except ManualUser.DoesNotExist:
            return JsonResponse(
                {"success": False, "message": "User not found"}, status=404
            )
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)
    else:
        return JsonResponse(
            {"success": False, "message": "Only POST method is allowed"}, status=405
        )


@csrf_exempt
def getUsername(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            user_id = body.get("id")

            if not user_id:
                return JsonResponse(
                    {"success": False, "message": "User ID is required"}, status=400
                )

            user = ManualUser.objects.get(id=user_id)

            return JsonResponse({"success": True, "username": user.username})

        except ManualUser.DoesNotExist:
            return JsonResponse(
                {"success": False, "message": "User not found"}, status=404
            )
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)
    else:
        return JsonResponse(
            {"success": False, "message": "Only POST method is allowed"}, status=405
        )


def get_user_id(request, username):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)
    try:
        user = ManualUser.objects.get(username=username)
        return JsonResponse({"success": True, "user_id": user.id})
    except ManualUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)


@csrf_exempt
def get_game_history(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)

    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id parameter is required"}, status=400)

    try:
        history_entries = GameHistory.objects.filter(
            Q(winner_id=user_id) | Q(loser_id=user_id)
        ).order_by("-created_at")[:20]

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

        return JsonResponse(
            {"success": True, "history": history_list, "winrate": winrate}
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_profile(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)

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
        return JsonResponse({"error": str(e)}, status=500)


from PIL import Image

ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]
MAX_FILE_SIZE = 5 * 1024 * 1024


@csrf_exempt
def upload_profile_picture(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "error": "POST method required"}, status=200
        )
    try:
        user_id = request.POST.get("user_id")
        if not user_id:
            return JsonResponse(
                {"success": False, "error": "Missing user_id"}, status=200
            )
        if "profile_picture" not in request.FILES:
            return JsonResponse(
                {"success": False, "error": "No file uploaded"}, status=200
            )

        file = request.FILES["profile_picture"]

        if file.size > MAX_FILE_SIZE:
            return JsonResponse(
                {"success": False, "error": "File too large"}, status=200
            )

        ext = os.path.splitext(file.name)[1].lower().strip(".")
        if ext not in ALLOWED_EXTENSIONS:
            return JsonResponse(
                {"success": False, "error": "Invalid file format"}, status=200
            )

        try:
            image = Image.open(file)
            image.verify()
        except Exception:
            return JsonResponse(
                {"success": False, "error": "Uploaded file is not a valid image"},
                status=200,
            )

        user = ManualUser.objects.get(id=user_id)

        old_image_path = user.profile_picture.path if user.profile_picture else None

        user.profile_picture = file
        user.save()

        default_filename = "default-profile-150.png"
        if old_image_path and os.path.exists(old_image_path):
            if os.path.basename(old_image_path) != default_filename:
                try:
                    os.remove(old_image_path)
                except Exception as e:
                    return JsonResponse(
                        {"success": False, "error": "img not found"}, status=200
                    )

        return JsonResponse(
            {"success": True, "profile_picture": user.profile_picture.url}, status=200
        )
    except ManualUser.DoesNotExist:
        return JsonResponse({"success": False, "error": "User not found"}, status=200)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=200)


def search_pilots(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)

    query = request.GET.get("query")
    if not query:
        return JsonResponse({"error": "Query parameter is required"}, status=400)

    pilots = ManualUser.objects.filter(username__istartswith=query)
    results = []
    for pilot in pilots:
        results.append(
            {
                "username": pilot.username,
                "user_id": pilot.id,
                "is_connected": pilot.is_connected,
            }
        )

    return JsonResponse({"success": True, "pilots": results})


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from service.models import ManualUser


@csrf_exempt
def get_leaderboard(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=405)

    players = ManualUser.objects.filter(elo__gt=0).order_by("-elo")[:500]

    results = [
        {"rank": index + 1, "username": player.username, "elo": player.elo}
        for index, player in enumerate(players)
    ]

    return JsonResponse({"success": True, "players": results})
