import json
import bcrypt
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ManualUser
from cryptography.fernet import Fernet
import pyotp
import qrcode
from io import BytesIO
from django.conf import settings

cipher = Fernet(settings.FERNET_KEY)


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

            if ManualUser.objects.filter(email=encrypted_email).exists():
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
                phone_number=encrypted_phone
            ) 
            
            return JsonResponse({'success': True, 'message': 'User registered successfully', 'user_id': user.id})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)


