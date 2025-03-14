from django.db import models  # type: ignore
import pyotp  # type: ignore
from django.core.validators import FileExtensionValidator  # type: ignore


class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    is_2fa_enabled = models.BooleanField(default=False)
    twofa_method = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    is_dummy = models.BooleanField(default=False)
    current_tournament_id = models.IntegerField(default=0)
    is_connected = models.BooleanField(default=False)
    elo = models.IntegerField(default=0)
    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        default="profile_pics/default-profile-150.png",
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"])],
    )
    session_token = models.CharField(max_length=255, null=True, default=None)
    oauth_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    totp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username




class ManualFriendsRelations(models.Model):
    id = models.AutoField(primary_key=True)  # Added primary key for Django ORM
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="friends_initiated")
    friend = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="friends_received")
    initiator = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="friend_requests_sent")
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "friends"
        managed = False
        constraints = [models.UniqueConstraint(fields=["user", "friend"], name="unique_friendship")]

    def __str__(self):
        return f"{self.user.username} - {self.friend.username} ({self.status})"


class ManualBlockedRelations(models.Model):
    id = models.AutoField(primary_key=True)  # Added primary key
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="blocked_users")
    blocked_user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="blocked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blocks"
        managed = False
        constraints = [models.UniqueConstraint(fields=["user", "blocked_user"], name="unique_block")]

    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"


class ManualTournament(models.Model):
    id = models.AutoField(primary_key=True)
    size = models.IntegerField(default=0)
    name = models.CharField(max_length=255, default="TOURNAMENT_DEFAULT_NAME")
    organizer = models.ForeignKey(ManualUser, on_delete=models.SET_NULL, null=True, related_name="organized_tournaments")
    status = models.CharField(
        max_length=50,
        choices=[
            ("upcoming", "Upcoming"),
            ("ongoing", "Ongoing"),
            ("completed", "Completed"),
        ],
        default="upcoming",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tournaments"
        managed = False

    def __str__(self):
        return self.name


class ManualTournamentParticipants(models.Model):
    id = models.AutoField(primary_key=True)  # Added primary key
    tournament = models.ForeignKey(ManualTournament, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="tournaments")
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tournament_participants"
        managed = False
        constraints = [models.UniqueConstraint(fields=["tournament", "user"], name="unique_tournament_participant")]

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name} ({self.status})"


class ManualGameHistory(models.Model):
    id = models.AutoField(primary_key=True)
    winner_id = models.IntegerField(default=0)
    loser_id = models.IntegerField(default=0)
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "game_history"

    def __str__(self):
        return f"ManualGameHistory {self.id}: Winner {self.winner_id} vs Loser {self.loser_id}"


class TournamentMatch(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey("ManualTournament", on_delete=models.CASCADE, related_name="matches")
    round_number = models.IntegerField()
    match_order = models.IntegerField()  # l'ordre dans le round
    player1 = models.CharField(max_length=50, blank=True, null=True)
    player2 = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, default="pending")  # 'pending', 'ready' ,'completed', etc.
    winner = models.CharField(max_length=50, blank=True, null=True)
    score = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    match_key = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Round {self.round_number} Match {self.match_order}: {self.player1} vs {self.player2}"


class ManualPrivateGames(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="private_games_as_user")
    recipient = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="private_games_as_recipient")
    initiator = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="private_games_as_initiator")
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "private_games"
        managed = False
        constraints = [models.UniqueConstraint(fields=["user", "recipient"], name="unique_private_game")]

    def __str__(self):
        return f"Private game between {self.user.username} and {self.recipient.username} ({self.status})"
