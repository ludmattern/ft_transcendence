from django.db import models

# Simplified Manual user model in order to pick out usernames.
class ManualUser(models.Model):
    username = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "users"
        managed = False # Use this so Django doesn't manage it.

    def __str__(self):
        return self.username
