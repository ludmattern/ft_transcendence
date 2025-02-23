import json
import bcrypt
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ManualUser, GameHistory
from django.db.models import Q

from cryptography.fernet import Fernet
import pyotp
import qrcode
from io import BytesIO
from django.conf import settings

cipher = Fernet(settings.FERNET_KEY)

def decrypt_thing(encrypted_args):
    """Decrypts the args."""
    return cipher.decrypt(encrypted_args.encode('utf-8')).decode('utf-8')

def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode('utf-8')).decode('utf-8')

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
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            username = body.get('username')
            email = body.get('email')
            password = body.get('password')
            is_2fa_enabled = body.get('is_2fa_enabled', False)
            twofa_method = body.get('twofa_method', None)
            phone_number = body.get('phone_number', None)

            if not username or not email or not password:
                return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

            if ManualUser.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already taken'}, status=409)

            
            encrypted_email = encrypt_thing(email)

            existing_users = ManualUser.objects.all()

            for user in existing_users:
                decrypted_email = decrypt_thing(user.email)
                if decrypted_email == email:
                    return JsonResponse({'success': False, 'message': 'Email already in use'}, status=409)

            if is_2fa_enabled and twofa_method == 'sms' and not phone_number:
                return JsonResponse({'success': False, 'message': 'Phone number is required for SMS 2FA'}, status=400)

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            encrypted_phone = encrypt_thing(phone_number) if phone_number else None
            
            user = ManualUser.objects.create(
                username=username,
                email=encrypted_email,
                password=hashed_password,
                is_2fa_enabled=is_2fa_enabled,
                twofa_method=twofa_method,
                phone_number=encrypted_phone,
                is_dummy=False
            ) 
            
            return JsonResponse({'success': True, 'message': 'User registered successfully', 'user_id': user.id})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)


@csrf_exempt
def delete_account(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            username = body.get('username')

            user = ManualUser.objects.get(username=username)
            
            user.delete()
            
            return JsonResponse({'success': True, 'message': 'User registered successfully', 'user_id': user.id})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)

@csrf_exempt
def update_info(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            username= body.get('username')
            old_password = body.get('oldPassword')
            new_username = body.get('newUsername')
            new_password = body.get('newPassword')
            confirm_password = body.get('confirmPassword')
            new_email = body.get('newEmail')
            confirm_email = body.get('confirmEmail')

            user = ManualUser.objects.get(username=username)

            if old_password == '':
                return JsonResponse({'success': False, 'message': 'Please enter current password'}, status=401)

            if not bcrypt.checkpw(old_password.encode('utf-8'), user.password.encode('utf-8')):
                return JsonResponse({'success': False, 'message': 'Current password is incorrect'}, status=402)

            if new_username == '' and new_email == '' and new_password == '':
                return JsonResponse({'success': False, 'message': 'No changes to update'}, status=400)

            if new_username and ManualUser.objects.filter(username=new_username).exists():
                return JsonResponse({'success': False, 'message': 'Username already taken'}, status=409)
            if new_username:
                user.username = new_username

            if new_email:
                if new_email != confirm_email:
                    return JsonResponse({'success': False, 'message': 'Emails do not match'}, status=400)
                if new_email != decrypt_thing(user.email):
                    existing_users = ManualUser.objects.all()
                    for user in existing_users:
                        decrypted_email = decrypt_thing(user.email)
                        if decrypted_email == new_email:
                            return JsonResponse({'success': False, 'message': 'Email already in use'}, status=409)
                encrypted_email = encrypt_thing(new_email)
                user.email = encrypted_email

            if new_password:
                if new_password != confirm_password:
                    return JsonResponse({'success': False, 'message': 'Passwords do not match'}, status=400)
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user.password = hashed_password

            user.save()

            return JsonResponse({'success': True, 'message': 'Information updated successfully'})

        except ManualUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)
    
@csrf_exempt
def getUsername(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            user_id = body.get('id')

            if not user_id:
                return JsonResponse({'success': False, 'message': 'User ID is required'}, status=400)

            user = ManualUser.objects.get(id=user_id)

            return JsonResponse({'success': True, 'username': user.username})

        except ManualUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)

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
        ).order_by("-created_at")[:10]
        
        history_list = []
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
            
            history_list.append({
                "winner_id": entry.winner_id,
                "winner_username": winner_username,
                "loser_id": entry.loser_id,
                "loser_username": loser_username,
                "winner_score": entry.winner_score,
                "loser_score": entry.loser_score,
                "created_at": entry.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return JsonResponse({"success": True, "history": history_list})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)