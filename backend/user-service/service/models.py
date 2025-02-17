from django.db import models
from django.contrib.auth import get_user_model
import bcrypt
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


class ManualTournament(models.Model):
    id = models.AutoField(primary_key=True)
    serial_key = models.CharField(max_length=255, unique=True)
    rounds = models.IntegerField(default=0)
    name = models.CharField(max_length=255, default='TOURNAMENT_DEFAULT_NAME')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_tournaments')
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
    tournament = models.ForeignKey(ManualTournament, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournaments')
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

    class Meta:
        db_table = "tournament_participants"
        unique_together = ('tournament', 'user')
        managed = True

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name} ({self.status})"


class ManualNotifications(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', default=0)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications', default=0)
    type = models.CharField(
        max_length=50,
        choices=[
            ('private_game', 'Private Game'),
            ('tournament_invite', 'Tournament Invite'),
            ('tournament_turn', 'Tournament Turn')
        ],
        default='private_game'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'),
            ('expired', 'Expired')
        ],
        default='pending'
    )
    tournament = models.ForeignKey(ManualTournament, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    game = models.ForeignKey(ManualGameHistory, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notifications"
        managed = True

    def __str__(self):
        return f"Notification from {self.sender.username} to {self.receiver.username} ({self.type})"
