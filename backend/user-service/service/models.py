from django.db import models
import bcrypt
import pyotp

class ManualUser(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    is_2fa_enabled = models.BooleanField(default=False)
    twofa_method = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    temp_2fa_code = models.CharField(max_length=10, null=True, blank=True)
    totp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username


class Social(models.Model):
    username = models.CharField(max_length=50, unique=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "social"
        managed = True

    def __str__(self):
        return self.username