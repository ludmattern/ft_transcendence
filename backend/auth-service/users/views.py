import json
import bcrypt
from django.http import JsonResponse
from django.conf import settings
import datetime
from functools import wraps

from twilio.rest import Client

from django.core.mail import send_mail
import random

from django.views.decorators.csrf import csrf_exempt
from users.models import ManualUser
import jwt

import pyotp
import qrcode
from io import BytesIO
from django.http import HttpResponse

from cryptography.fernet import Fernet 

cipher = Fernet(settings.FERNET_KEY)

def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode('utf-8')).decode('utf-8')

def decrypt_thing(encrypted_args):
    """Decrypts the args."""
    return cipher.decrypt(encrypted_args.encode('utf-8')).decode('utf-8')


@csrf_exempt
def check_auth_view(request):
    token = request.COOKIES.get('access_token')
    if not token:
        return JsonResponse({'success': False, 'message': 'Cookie missing'}, status=401)

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        now = datetime.datetime.utcnow().timestamp()
        remaining = payload['exp'] - now
        if remaining < 10:
            new_exp = now + settings.JWT_EXP_DELTA_SECONDS
            new_payload = {**payload, "exp": new_exp}
            new_token = jwt.encode(
                new_payload,
                settings.JWT_SECRET_KEY,
                algorithm=settings.JWT_ALGORITHM
            )
            response = JsonResponse({'success': True, 'message': 'Cookie renewed'})
            response.set_cookie(
                key='access_token',
                value=new_token if isinstance(new_token, str) else new_token.decode('utf-8'),
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=settings.JWT_EXP_DELTA_SECONDS
            )
            return response

        return JsonResponse({'success': True, 'message': 'Cookie still valid'})

    except jwt.ExpiredSignatureError:
        return JsonResponse({'success': False, 'message': 'Token expired'}, status=401)
    except jwt.InvalidTokenError as e:
        return JsonResponse({'success': False, 'message': f'Invalid token: {e}'}, status=401)


def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.COOKIES.get('access_token', None)
        if not token:
            return JsonResponse({'success': False, 'message': 'No access_token cookie'}, status=401)

        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            return JsonResponse({'success': False, 'message': 'Token expired'}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=401)

        request.jwt_payload = payload
        return view_func(request, *args, **kwargs)
    return wrapper


@jwt_required
def protected_view(request):
    payload = getattr(request, 'jwt_payload', {})
    username = payload.get('sub')
    return JsonResponse({'success': True, 'message': f'Hello, {username}. You are authenticated!'})



def generate_2fa_code(length=6):
    """Retourne un code numérique à 6 chiffres."""
    return "".join(str(random.randint(0, 9)) for _ in range(length))

def send_2fa_email(recipient, code):
    subject = "Your 2FA Code"
    message = f"Hello,\nHere is your 2FA code: {code}\nRegards."
    send_mail(subject, message, None, [decrypt_thing(recipient)], fail_silently=False)

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

def send_2fa_sms(phone_number, code):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        message = client.messages.create(
            body=f"Your 2FA code is: {code}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=decrypt_thing(phone_number)
        )
        print("SMS sent, SID:", message.sid)
    except Exception as e:
        print("Error sending SMS:", e)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        import json
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        password = body.get('password')

        try:
            user = ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

        if user.is_2fa_enabled:
            if user.twofa_method == "email":
                code = generate_2fa_code()
                hashed_code = bcrypt.hashpw(code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user.temp_2fa_code = hashed_code
                user.save()
                send_2fa_email(user.email, code)
            elif user.twofa_method == "sms":
                code = generate_2fa_code()
                hashed_code = bcrypt.hashpw(code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user.temp_2fa_code = hashed_code
                user.save()
                send_2fa_sms(user.phone_number, code)

            return JsonResponse({
                'success': True,
                'message': '2FA required',
                'twofa_method': user.twofa_method
            }, status=200)

        now = datetime.datetime.utcnow()
        exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
        access_payload = {
            "sub": user.username,
            "iat": now,
            "exp": exp.timestamp()
        }
        access_token = jwt.encode(
            access_payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        access_token_str = access_token if isinstance(access_token, str) else access_token.decode('utf-8')

        response = JsonResponse({'success': True, 'message': 'Logged in'})
        response.set_cookie(
            key='access_token',
            value=access_token_str,
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=settings.JWT_EXP_DELTA_SECONDS
        )
        return response

    return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)



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


@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        response = JsonResponse({'success': True, 'message': 'Logged out'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)


@csrf_exempt
def verify_2fa_view(request):
    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        code = body.get('twofa_code')

        try:
            user = ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

        if user.twofa_method == "authenticator-app":
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                now = datetime.datetime.utcnow()
                exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
                access_payload = {
                    "sub": user.username,
                    "iat": now,
                    "exp": exp.timestamp()
                }
                access_token = jwt.encode(
                    access_payload,
                    settings.JWT_SECRET_KEY,
                    algorithm=settings.JWT_ALGORITHM
                )
                access_token_str = (access_token if isinstance(access_token, str)
                                else access_token.decode('utf-8'))
                response = JsonResponse({'success': True, 'message': '2FA verified'})
                response.set_cookie(
                    key='access_token',
                    value=access_token_str,
                    httponly=True,
                    secure=True,
                    samesite='Strict',
                    max_age=settings.JWT_EXP_DELTA_SECONDS
                )
                return response
            else:
                return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=401)
        elif bcrypt.checkpw(code.encode('utf-8'), user.temp_2fa_code.encode('utf-8')):
            now = datetime.datetime.utcnow()
            exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
            access_payload = {
                "sub": user.username,
                "iat": now,
                "exp": exp.timestamp()
            }
            access_token = jwt.encode(
                access_payload,
                settings.JWT_SECRET_KEY,
                algorithm=settings.JWT_ALGORITHM
            )
            access_token_str = (access_token if isinstance(access_token, str)
                                else access_token.decode('utf-8'))
            response = JsonResponse({'success': True, 'message': '2FA verified'})
            response.set_cookie(
                key='access_token',
                value=access_token_str,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=settings.JWT_EXP_DELTA_SECONDS
            )
            return response
        else:
            return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=401)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)


# import json
# import bcrypt
# from django.http import JsonResponse
# from django.conf import settings
# import datetime
# from functools import wraps

# from twilio.rest import Client

# from django.core.mail import send_mail
# import random

# from django.views.decorators.csrf import csrf_exempt
# from users.models import ManualUser
# import jwt

# import pyotp
# import qrcode
# from io import BytesIO
# from django.http import HttpResponse

# from cryptography.fernet import Fernet

# cipher = Fernet(settings.FERNET_KEY)

# def encrypt_thing(email):
#     try:
#         return cipher.encrypt(email.encode('utf-8')).decode('utf-8')
#     except Exception as e:
#         raise ValueError(f"Email encryption failed: {str(e)}")

# def decrypt_thing(encrypted_email):
#     try:
#         return cipher.decrypt(encrypted_email.encode('utf-8')).decode('utf-8')
#     except Exception as e:
#         raise ValueError(f"Email decryptionna failed: {str(e)}")

# @csrf_exempt
# def check_auth_view(request):
#     token = request.COOKIES.get('access_token')
#     if not token:
#         return JsonResponse({'success': False, 'message': 'Cookie missing'}, status=401)

#     try:
#         payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
#         now = datetime.datetime.utcnow().timestamp()
#         remaining = payload['exp'] - now
#         if remaining < 10:
#             new_exp = now + settings.JWT_EXP_DELTA_SECONDS
#             new_payload = {**payload, "exp": new_exp}
#             new_token = jwt.encode(
#                 new_payload,
#                 settings.JWT_SECRET_KEY,
#                 algorithm=settings.JWT_ALGORITHM
#             )
#             response = JsonResponse({'success': True, 'message': 'Cookie renewed'})
#             response.set_cookie(
#                 key='access_token',
#                 value=new_token if isinstance(new_token, str) else new_token.decode('utf-8'),
#                 httponly=True,
#                 secure=True,
#                 samesite='Strict',
#                 max_age=settings.JWT_EXP_DELTA_SECONDS
#             )
#             return response

#         return JsonResponse({'success': True, 'message': 'Cookie still valid'})

#     except jwt.ExpiredSignatureError:
#         return JsonResponse({'success': False, 'message': 'Token expired'}, status=401)
#     except jwt.InvalidTokenError as e:
#         return JsonResponse({'success': False, 'message': f'Invalid token: {e}'}, status=401)


# def jwt_required(view_func):
#     @wraps(view_func)
#     def wrapper(request, *args, **kwargs):
#         token = request.COOKIES.get('access_token', None)
#         if not token:
#             return JsonResponse({'success': False, 'message': 'No access_token cookie'}, status=401)

#         try:
#             payload = jwt.decode(
#                 token,
#                 settings.JWT_SECRET_KEY,
#                 algorithms=[settings.JWT_ALGORITHM]
#             )
#         except jwt.ExpiredSignatureError:
#             return JsonResponse({'success': False, 'message': 'Token expired'}, status=401)
#         except jwt.InvalidTokenError as e:
#             return JsonResponse({'success': False, 'message': str(e)}, status=401)

#         request.jwt_payload = payload
#         return view_func(request, *args, **kwargs)
#     return wrapper


# @jwt_required
# def protected_view(request):
#     payload = getattr(request, 'jwt_payload', {})
#     username = payload.get('sub')
#     return JsonResponse({'success': True, 'message': f'Hello, {username}. You are authenticated!'})



# def generate_2fa_code(length=6):
#     """Retourne un code numérique à 6 chiffres."""
#     return "".join(str(random.randint(0, 9)) for _ in range(length))

# def send_2fa_email(recipient, code):
#     subject = "Your 2FA Code"
#     message = f"Hello,\nHere is your 2FA code: {code}\nRegards."
#     send_mail(subject, message, None, [recipient], fail_silently=False)

# def generate_qr_code(request, username):
#     try:
#         user = ManualUser.objects.get(username=username)
#         totp = pyotp.TOTP(user.totp_secret)
#         uri = totp.provisioning_uri(name=username, issuer_name="ft_transcendence")
#         qr = qrcode.make(uri)
#         buffer = BytesIO()
#         qr.save(buffer, format="PNG")
#         buffer.seek(0)
#         return HttpResponse(buffer, content_type="image/png")
#     except ManualUser.DoesNotExist:
#         return HttpResponse("User not found", status=404)

# def send_2fa_sms(phone_number, code):
#     client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
#     try:
#         message = client.messages.create(
#             body=f"Your 2FA code is: {code}",
#             from_=settings.TWILIO_PHONE_NUMBER,
#             to=phone_number
#         )
#         print("SMS sent, SID:", message.sid)
#     except Exception as e:
#         print("Error sending SMS:", e)


# @csrf_exempt
# def login_view(request):
#     if request.method == 'POST':
#         import json
#         body = json.loads(request.body.decode('utf-8'))
#         username = body.get('username')
#         password = body.get('password')

#         try:
#             user = ManualUser.objects.get(username=username)
#         except ManualUser.DoesNotExist:
#             return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

#         if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
#             return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

#         if user.is_2fa_enabled:
#             if user.twofa_method == "email":
#                 code = generate_2fa_code()
#                 hashed_code = bcrypt.hashpw(code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
#                 user.temp_2fa_code = hashed_code
#                 user.save()
#                 send_2fa_email(decrypt_thing(user.email), code)
#             elif user.twofa_method == "sms":
#                 code = generate_2fa_code()
#                 hashed_code = bcrypt.hashpw(code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
#                 user.temp_2fa_code = hashed_code
#                 user.save()
#                 send_2fa_sms(user.phone_number, code)

#             return JsonResponse({
#                 'success': True,
#                 'message': '2FA required',
#                 'twofa_method': user.twofa_method
#             }, status=200)

#         now = datetime.datetime.utcnow()
#         exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
#         access_payload = {
#             "sub": user.username,
#             "iat": now,
#             "exp": exp.timestamp()
#         }
#         access_token = jwt.encode(
#             access_payload,
#             settings.JWT_SECRET_KEY,
#             algorithm=settings.JWT_ALGORITHM
#         )
#         access_token_str = access_token if isinstance(access_token, str) else access_token.decode('utf-8')

#         response = JsonResponse({'success': True, 'message': 'Logged in'})
#         response.set_cookie(
#             key='access_token',
#             value=access_token_str,
#             httponly=True,
#             secure=True,
#             samesite='Strict',
#             max_age=settings.JWT_EXP_DELTA_SECONDS
#         )
#         return response

#     return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)



# @csrf_exempt
# def register_user(request):
#     if request.method == 'POST':
#         try:
#             body = json.loads(request.body.decode('utf-8'))
#             username = body.get('username')
#             email = body.get('email')
#             password = body.get('password')
#             is_2fa_enabled = body.get('is_2fa_enabled', False)
#             twofa_method = body.get('twofa_method', None)
#             phone_number = body.get('phone_number', None)

#             if not username or not email or not password:
#                 return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

#             if ManualUser.objects.filter(username=username).exists():
#                 return JsonResponse({'success': False, 'message': 'Username already taken'}, status=409)

#             encrypted_email = encrypt_thing(email)
#             if ManualUser.objects.filter(email=encrypted_email).exists():
#                 return JsonResponse({'success': False, 'message': 'Email already in use'}, status=409)

#             if is_2fa_enabled and twofa_method == 'sms' and not phone_number:
#                 return JsonResponse({'success': False, 'message': 'Phone number is required for SMS 2FA'}, status=400)

#             hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
#             user = ManualUser.objects.create(
#                 username=username,
#                 email=encrypted_email,
#                 password=hashed_password,
#                 is_2fa_enabled=is_2fa_enabled,
#                 twofa_method=twofa_method,
#                 phone_number=phone_number
#             )

#             return JsonResponse({'success': True, 'message': 'User registered successfully', 'user_id': user.id})

#         except Exception as e:
#             return JsonResponse({'success': False, 'message': str(e)}, status=500)
#     else:
#         return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)


# @csrf_exempt
# def logout_view(request):
#     if request.method == 'POST':
#         response = JsonResponse({'success': True, 'message': 'Logged out'})
#         response.delete_cookie('access_token')
#         response.delete_cookie('refresh_token')
#         return response
#     return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)


# @csrf_exempt
# def verify_2fa_view(request):
#     if request.method == 'POST':
#         body = json.loads(request.body.decode('utf-8'))
#         username = body.get('username')
#         code = body.get('twofa_code')

#         try:
#             user = ManualUser.objects.get(username=username)
#         except ManualUser.DoesNotExist:
#             return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

#         if user.twofa_method == "authenticator-app":
#             totp = pyotp.TOTP(user.totp_secret)
#             if totp.verify(code):
#                 now = datetime.datetime.utcnow()
#                 exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
#                 access_payload = {
#                     "sub": user.username,
#                     "iat": now,
#                     "exp": exp.timestamp()
#                 }
#                 access_token = jwt.encode(
#                     access_payload,
#                     settings.JWT_SECRET_KEY,
#                     algorithm=settings.JWT_ALGORITHM
#                 )
#                 access_token_str = (access_token if isinstance(access_token, str)
#                                 else access_token.decode('utf-8'))
#                 response = JsonResponse({'success': True, 'message': '2FA verified'})
#                 response.set_cookie(
#                     key='access_token',
#                     value=access_token_str,
#                     httponly=True,
#                     secure=True,
#                     samesite='Strict',
#                     max_age=settings.JWT_EXP_DELTA_SECONDS
#                 )
#                 return response
#             else:
#                 return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=401)
#         elif bcrypt.checkpw(code.encode('utf-8'), user.temp_2fa_code.encode('utf-8')):
#             now = datetime.datetime.utcnow()
#             exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
#             access_payload = {
#                 "sub": user.username,
#                 "iat": now,
#                 "exp": exp.timestamp()
#             }
#             access_token = jwt.encode(
#                 access_payload,
#                 settings.JWT_SECRET_KEY,
#                 algorithm=settings.JWT_ALGORITHM
#             )
#             access_token_str = (access_token if isinstance(access_token, str)
#                                 else access_token.decode('utf-8'))
#             response = JsonResponse({'success': True, 'message': '2FA verified'})
#             response.set_cookie(
#                 key='access_token',
#                 value=access_token_str,
#                 httponly=True,
#                 secure=True,
#                 samesite='Strict',
#                 max_age=settings.JWT_EXP_DELTA_SECONDS
#             )
#             return response
#         else:
#             return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=401)
#     else:
#         return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)

