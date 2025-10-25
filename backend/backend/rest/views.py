from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import User, UserProfile
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer
from .ML.engine import CompatibilityEngine
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

engine = CompatibilityEngine()


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        request_body=UserRegistrationSerializer,
        responses={
            201: openapi.Response('Пользователь успешно зарегистрирован'),
            400: openapi.Response('Ошибка валидации'),
        },
        operation_summary="Регистрация пользователя",
        operation_description="Создаёт нового пользователя и автоматически его профиль"
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Пользователь успешно зарегистрирован",
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer


class MatchView(views.APIView):
    def get(self, request, user_id):
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)

        others = list(UserProfile.objects.exclude(id=user_id))
        if not others:
            return Response({"error": "Недостаточно пользователей для рекомендаций"}, status=status.HTTP_400_BAD_REQUEST)

        engine = CompatibilityEngine()
        recommendations = engine.recommend(user, others)

        return Response({
            "user_id": user_id,
            "recommendations": recommendations
        }, status=status.HTTP_200_OK)