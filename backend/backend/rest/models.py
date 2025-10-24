from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)
    telegram_id = models.CharField(max_length=32, blank=True, null=True, unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
    
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    inerests = models.JSONField(default=list)
    goals = models.TextField(blank=True)
    locations = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.username
    
