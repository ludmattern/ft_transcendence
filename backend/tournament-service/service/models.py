from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Tournament(models.Model):
    serial_key = models.CharField(max_length=255, unique=True)
    rounds = models.IntegerField(default=0)
    name = models.CharField(max_length=255, default='TOURNAMENT_DEFAULT_NAME')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='upcoming')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.serial_key})"
