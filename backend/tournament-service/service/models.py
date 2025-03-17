from django.db import models  # type: ignore

class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    tournament_status = models.CharField(
        max_length=20,
        choices=[
            ("out", "Out"),
            ("lobby", "Lobby"),
            ("participating", "Participating"),
        ],
        default="out",
    )
    is_dummy = models.BooleanField(default=False)
    current_tournament_id = models.IntegerField(default=0)
    token_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_token = models.CharField(max_length=255, null=True, default=None)
    alias = models.CharField(max_length=255, null=True, blank=True, default=None)
    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username


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
    mode = models.CharField(
        max_length=10,
        choices=[("local", "Local"), ("online", "Online")],
        default="local",
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
    tournament = models.ForeignKey(ManualTournament, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(ManualUser, on_delete=models.CASCADE, related_name="tournaments")
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
            ("left", "Left"),
            ("eliminated", "Eliminated"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tournament_participants"
        managed = True
        constraints = [models.UniqueConstraint(fields=["tournament", "user"], name="unique_tournament_participant")]

    def __str__(self):
        return f"{self.user.username} in {self.tournament.name} ({self.status})"


class TournamentMatch(models.Model):
    id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey("ManualTournament", on_delete=models.CASCADE, related_name="matches")
    round_number = models.IntegerField()
    match_order = models.IntegerField() 

    player1_id = models.IntegerField(blank=True, null=True)
    player2_id = models.IntegerField(blank=True, null=True)
    winner_id = models.IntegerField(blank=True, null=True)

    status = models.CharField(max_length=20, default="pending")
    score = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    match_key = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Round {self.round_number}, Match {self.match_order} (IDs: {self.player1_id} vs {self.player2_id})"
