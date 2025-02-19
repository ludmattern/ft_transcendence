from django.db import models
from django.db import models
import pyotp

class ManualUser(models.Model):
    id = models.CharField(max_length=50, unique=True, primary_key=True)
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
    session_token = models.CharField(max_length=255, null=True, default=None)


    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username




class Tournament(models.Model):
    serial_key = models.CharField(max_length=255, unique=True)
    rounds = models.IntegerField(default=0)
    name = models.CharField(max_length=255, default='TOURNAMENT_DEFAULT_NAME')
    organizer = models.ForeignKey(ManualUser, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='upcoming')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.serial_key})"


class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        related_name="participants",
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        ManualUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.tournament.serial_key}"