from django.db import models


class ManualUser(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    is_connected = models.BooleanField(default=False)


    class Meta:
        db_table = "users"
        managed = True

    def __str__(self):
        return self.username
