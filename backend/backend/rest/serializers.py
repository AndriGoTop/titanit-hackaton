from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    telegram_id = serializers.CharField(source='user.telegram_id')
    username = serializers.CharField(source='user.username', read_only=True) 
    photo = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ["id",'bio', "telegram_id", "email",'skills','inerests', 'goals', 'locations', "gender", "profession","bithday", "expirience", "username", 'photo', 'photo']
        read_only_fields = ['user']
        extra_kwargs = {
            "bio": {"required": False},
            "skills": {"required": False},
            "interests": {"required": False},
            "goals": {"required": False},
            "locations": {"required": False},
            "gender": {"required": False},
            "profession": {"required": False},
            "photo": {"required": False},
            "bithday": {"required": False},
            "expirience": {"required": False},
        }
    def update(self, instance, validated_data):
        # Сначала обновим связанные поля User
        user_data = validated_data.pop('user', {})
        if 'telegram_id' in user_data:
            instance.user.telegram_id = user_data['telegram_id']
            instance.user.save()
        
        # Обновляем поля UserProfile
        return super().update(instance, validated_data)

    def get_photo(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        elif obj.photo:
            return f"http://127.0.0.1:8000{obj.photo.url}"
        return None
    
class UserSerializer(serializers.ModelSerializer):
    # profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        instance = super().update(instance, validated_data)
        
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'telegram_id', 'profile']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        if profile_data:
            profile_data.pop('user', None)
            UserProfile.objects.create(user=user, **profile_data)
        else:
            UserProfile.objects.create(user=user)
        
        return user