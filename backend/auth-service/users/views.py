import json
import bcrypt
from django.http import JsonResponse
from django.conf import settings
import datetime
from functools import wraps

from django.views.decorators.csrf import csrf_exempt
from users.models import ManualUser
import jwt

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', None)
        if not auth_header:
            return JsonResponse({'success': False, 'message': 'No authorization header'}, status=401)

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != 'Bearer':
            return JsonResponse({'success': False, 'message': 'Invalid token format'}, status=401)

        token = parts[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            return JsonResponse({'success': False, 'message': 'Token expired'}, status=401)
        except jwt.DecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid token'}, status=401)
        except jwt.InvalidTokenError as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=401)

        # Stocker le payload si besoin
        request.jwt_payload = payload
        return view_func(request, *args, **kwargs)
    return wrapper

@jwt_required
def protected_view(request):
    payload = getattr(request, 'jwt_payload', {})
    username = payload.get('sub')
    return JsonResponse({'success': True, 'message': f'Hello, {username}. You are authenticated!'})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))
        username = body.get('username')
        password = body.get('password')

        try:
            user = ManualUser.objects.get(username=username)
        except ManualUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

        now = datetime.datetime.utcnow()
        exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
        access_payload = {
            "sub": user.username,
            "iat": now,
            "exp": exp
        }
        access_token = jwt.encode(
            access_payload,
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )

        # Générer un refresh token
        # => Nécessite une autre clé ou la même, selon ta logique
        refresh_payload = {
            "sub": user.username,
            "iat": now,
            "exp": now + datetime.timedelta(seconds=settings.JWT_REFRESH_EXPIRE)
        }
        refresh_token = jwt.encode(
            refresh_payload,
            settings.JWT_SECRET_KEY_REFRESH,  # la clé de refresh
            algorithm=settings.JWT_ALGORITHM
        )

        return JsonResponse({
            'success': True,
            'message': 'Logged in',
            'access_token': access_token if isinstance(access_token, str) else access_token.decode('utf-8'),
            'refresh_token': refresh_token if isinstance(refresh_token, str) else refresh_token.decode('utf-8'),
        })
    else:
        return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            username = body.get('username')
            email = body.get('email')
            password = body.get('password')

            if not username or not email or not password:
                return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

            if ManualUser.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already taken'}, status=409)

            if ManualUser.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already in use'}, status=409)

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            user = ManualUser.objects.create(username=username, email=email, password=hashed_password)
            return JsonResponse({'success': True, 'message': 'User registered successfully', 'user_id': user.id})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST method is allowed'}, status=405)
    
@csrf_exempt
def refresh_token_view(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            refresh_token = body.get('refresh_token')

            if not refresh_token:
                return JsonResponse({'success': False, 'message': 'Refresh token missing'}, status=400)

            # Décoder et vérifier le refresh token
            payload = jwt.decode(
                refresh_token,
                settings.JWT_SECRET_KEY_REFRESH,
                algorithms=[settings.JWT_ALGORITHM]
            )

            # Générer un nouveau access token
            now = datetime.datetime.utcnow()
            exp = now + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)

            new_payload = {
                "sub": payload['sub'],  # Même utilisateur
                "iat": now,
                "exp": exp
            }

            new_access_token = jwt.encode(
                new_payload,
                settings.JWT_SECRET_KEY,
                algorithm=settings.JWT_ALGORITHM
            )

            return JsonResponse({
                'success': True,
                'access_token': new_access_token,
            })

        except jwt.ExpiredSignatureError:
            return JsonResponse({'success': False, 'message': 'Refresh token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'success': False, 'message': 'Invalid refresh token'}, status=401)
    else:
        return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)
    
