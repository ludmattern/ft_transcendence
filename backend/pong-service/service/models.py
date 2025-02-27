from django.db import models

class GameHistory(models.Model):
    id = models.AutoField(primary_key=True)
    winner_id = models.IntegerField(default=0)
    loser_id = models.IntegerField(default=0)
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "game_history"

    def __str__(self):
        return f"GameHistory {self.id}: Winner {self.winner_id} vs Loser {self.loser_id}"



class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    elo = models.IntegerField(default=0)


    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username
