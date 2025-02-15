from django.db import models
from django.contrib.auth import get_user_model
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
    
class ManualGameHistory(models.Model):
    game_id = models.CharField(max_length=50, unique=True, primary_key=True)
    winner_id = models.CharField(max_length=50)
    loser_id = models.CharField(max_length=50)
    class Meta:
        db_table = "game_history"
        managed = True

    def __str__(self):
        return self.game_id

User = get_user_model()
    
class ManualFriendsRelations(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends_initiated")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends_received")
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "friends"
        unique_together = ("user", "friend")

    def __str__(self):
        return f"{self.user.username} - {self.friend.username} ({self.status})"


    
class ManualBlockedRelations(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_users")
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blocks"
        unique_together = ("user", "blocked_user")
        
    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"
