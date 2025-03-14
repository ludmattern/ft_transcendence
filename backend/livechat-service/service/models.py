from django.db import models  # type: ignore
from django.core.validators import FileExtensionValidator  # type: ignore


class ManualUser(models.Model):
    id = models.CharField(max_length=50, unique=True, primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        default="profile_pics/default-profile-150.png",
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png", "webp"])
        ],
    )
    tournament_status = models.CharField(
        max_length=20,
        choices=[
            ("out", "Out"),
            ("lobby", "Lobby"),
            ("participating", "Participating"),
        ],
        default="out",
    )

    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username


class ManualGameHistory(models.Model):
    id = models.AutoField(primary_key=True)
    winner = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="games_won"
    )
    loser = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="games_lost"
    )
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)

    class Meta:
        db_table = "game_history"
        managed = True

    def __str__(self):
        return f"Game {self.id}: {self.winner.username} vs {self.loser.username}"


class ManualFriendsRelations(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="friends_initiated"
    )
    friend = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="friends_received"
    )
    initiator = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="friend_requests_sent"
    )
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
        managed = True
        constraints = [
            models.UniqueConstraint(fields=["user", "friend"], name="unique_friendship")
        ]

    def __str__(self):
        return f"{self.user.username} - {self.friend.username} ({self.status})"


class ManualBlockedRelations(models.Model):
    id = models.AutoField(primary_key=True)  # Added primary key
    user = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="blocked_users"
    )
    blocked_user = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="blocked_by"
    )
    initiator_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blocks"
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["user", "blocked_user"], name="unique_block"
            )
        ]

    def __str__(self):
        return f"{self.user.username} blocked {self.blocked_user.username}"


class ManualTournament(models.Model):
    id = models.AutoField(primary_key=True)
    serial_key = models.CharField(max_length=255, unique=True)
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
        managed = True

    def __str__(self):
        return self.name


class ManualTournamentParticipants(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(
        ManualTournament, on_delete=models.CASCADE, related_name="participants"
    )
    user = models.ForeignKey(
        ManualUser, on_delete=models.CASCADE, related_name="tournaments"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
            ("still flying", "Still Flying"),
            ("eliminated", "Eliminated"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tournament_participants"
        managed = True
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "user"], name="unique_tournament_participant"
            )
        ]

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name} ({self.status})"


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
            ("expired", "Expired"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "private_games"
        managed = True
        constraints = [models.UniqueConstraint(fields=["user", "recipient"], name="unique_private_game")]

    def __str__(self):
        return f"Private game between {self.user.username} and {self.recipient.username} ({self.status})"
