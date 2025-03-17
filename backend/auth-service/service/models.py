from django.db import models  # type: ignore
import pyotp  # type: ignore

class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)
    twofa_method = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    temp_2fa_code = models.CharField(max_length=10, null=True, blank=True)
    temp_reset_code = models.CharField(max_length=10, null=True, blank=True)
    reset_code_expiry = models.DateTimeField(null=True, blank=True)
    totp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_token = models.CharField(max_length=255, null=True, default=None)
    is_dummy = models.BooleanField(default=False)
    oauth_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    alias = models.CharField(max_length=255, null=True, blank=True, default=None)

    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username

