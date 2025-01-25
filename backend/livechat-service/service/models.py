from django.db import models

class ManualUser(models.Model):
    username = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "users"
        managed = False  # Django won't manage this table