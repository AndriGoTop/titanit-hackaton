from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
)
from .ML.engine import CompatibilityEngine
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

engine = CompatibilityEngine()


# Список всех пользователей
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]
    # Схема для регистрации через документацию swagger
    @swagger_auto_schema(
        request_body=UserRegistrationSerializer,
        responses={
            201: openapi.Response("Пользователь успешно зарегистрирован"),
            400: openapi.Response("Ошибка валидации"),
        },
        operation_summary="Регистрация пользователя",
        operation_description="Создаёт нового пользователя и автоматически его профиль",
    )
    # Регистрация пользователя с валидацией в сериализаторе
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Пользователь успешно зарегистрирован", "user_id": user.id},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    # Получаем только свой профиль
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    # Позволяет редактировать только свой профиль
    def get_object(self):
        return self.request.user.profile

    # Запрещает создавать пользователя
    def create(self, request, *args, **kwargs):
        return Response(
            {"error": "Создание профиля недоступно"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    # Запрещает удалять пользователя
    def destroy(self, request, *args, **kwargs):
        return Response(
            {"error": "Удаление профиля недоступно"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class MatchView(views.APIView):
    def get(self, request, user_id):
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND
            )
        engine = CompatibilityEngine()
        others = list(UserProfile.objects.exclude(id=user_id))
        engine.build_user_index(others)
        if not others:
            return Response(
                {"error": "Недостаточно пользователей для рекомендаций"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Предоставляет рекомендательную систему

        recommendations = engine.recommend(user)

        return Response(
            {"user_id": user_id, "recommendations": recommendations},
            status=status.HTTP_200_OK,
        )
