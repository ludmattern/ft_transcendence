
from django.db import models
import pyotp

class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
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

class ManualTournament(models.Model):
    id = models.AutoField(primary_key=True)
    serial_key = models.CharField(max_length=255, unique=True)
    rounds = models.IntegerField(default=0)
    name = models.CharField(max_length=255, default='TOURNAMENT_DEFAULT_NAME')
    organizer = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name='organized_tournaments')
    status = models.CharField(
        max_length=50,
        choices=[
            ('upcoming', 'Upcoming'),
            ('ongoing', 'Ongoing'),
            ('completed', 'Completed')
        ],
        default='upcoming'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tournaments"
        managed = True

    def __str__(self):
        return self.name


class ManualTournamentParticipants(models.Model):
    id = models.AutoField(primary_key=True)  # ✅ Added primary key
    tournament = models.ForeignKey(ManualTournament, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name='tournaments')
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'),
            ('still flying', 'Still Flying'),
            ('eliminated', 'Eliminated')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tournament_participants"
        managed = True
        constraints = [
            models.UniqueConstraint(fields=["tournament", "user"], name="unique_tournament_participant")
        ]

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name} ({self.status})"