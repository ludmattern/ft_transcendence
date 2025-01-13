import json
import bcrypt
from django.http import JsonResponse
from django.conf import settings
import datetime
from functools import wraps

from django.views.decorators.csrf import csrf_exempt
from users.models import ManualUser
import jwt

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

@csrf_exempt
def login_view(request):
    """
    Login avec génération d'un access_token (stocké dans un cookie HTTP-only)
    et d'un refresh_token renvoyé dans la réponse JSON.
    """
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

        refresh_payload = {
            "sub": user.username,
            "iat": now,
            "exp": (now + datetime.timedelta(seconds=settings.JWT_REFRESH_EXPIRE)).timestamp()
        }
        refresh_token = jwt.encode(
            refresh_payload,
            settings.JWT_SECRET_KEY_REFRESH,
            algorithm=settings.JWT_ALGORITHM
        )
        refresh_token_str = refresh_token if isinstance(refresh_token, str) else refresh_token.decode('utf-8')

        response_data = {
            'success': True,
            'message': 'Logged in',
            'refresh_token': refresh_token_str,
        }
        response = JsonResponse(response_data)

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
def logout_view(request):
    if request.method == 'POST':
        response = JsonResponse({'success': True, 'message': 'Logged out'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)
