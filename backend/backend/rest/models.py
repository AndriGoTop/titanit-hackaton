from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=120, blank=True, null=True)
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
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bithday = models.DateField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    inerests = models.TextField(blank=True, null=True)
    goals = models.TextField(blank=True, null=True)
    locations = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    profession = models.CharField(max_length=120, blank=True, null=True)
    photo = models.ImageField(upload_to='user_photos/', blank=True, null=True)
    expirience = models.IntegerField( blank=True, null=True)

    def __str__(self):
        return self.user.username
    
