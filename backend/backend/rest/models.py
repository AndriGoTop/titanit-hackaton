from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    #Фио
    email = models.EmailField(unique=True)
    telegram_id = models.CharField(max_length=32, blank=True, null=True, unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
    
    
class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('Мужской', 'Мужской'),
        ('Женский', 'Женский'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bithday = models.DateField(blank=True, null=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    inerests = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    locations = models.CharField(max_length=255, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    profession = models.CharField(max_length=120, blank=True, null=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    #стаж
    def __str__(self):
        return self.username
    
