from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count
from .documents import UserProfileDocument
from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
)
from .ML.engine import CompatibilityEngine
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import PermissionDenied


engine = CompatibilityEngine()

class UserAPIListPagination(PageNumberPagination):
    page_size = 16
    page_size_query_param = "page_size"
    max_page_size = 1000

class UserViewSet(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = UserAPIListPagination

    # Поиск пользователей по поисковому запросу 
    def get_search(self, request):
        search_query = request.query_params.get("search", None)
        if not search_query:
            return Response({"error": "Не указан поисковый запрос"}, status=status.HTTP_400_BAD_REQUEST)


        s = UserProfileDocument.search().query(
            "multi_match",
            query=search_query,  # например "django python"
            fields=["skills", "inerests", "profession", "locations"],
            type="cross_fields",  # учитываем все поля как одно логическое поле
            operator="and"        # все слова из search_query должны присутствовать
        )

        # Пагинация
        page_size = self.pagination_class.page_size
        page_number = int(request.query_params.get("page", 1))
        start = (page_number - 1) * page_size
        end = start + page_size
        s = s[start:end]

        response_es = s.execute()

        # Получаем профили из базы
        profile_ids = [int(hit.meta.id) for hit in response_es.hits]
        profiles = UserProfile.objects.filter(id__in=profile_ids)
        profile_map = {p.id: p for p in profiles}
        ordered_profiles = [profile_map[i] for i in profile_ids if i in profile_map]

        serializer = UserProfileSerializer(ordered_profiles, many=True)
        total_hits = response_es.hits.total.value

        # Пагинация в ответе
        next_url = previous_url = None
        current_path_base = request.build_absolute_uri(request.path).split("?")[0]

        def build_paginated_url(page_num):
            params = f"page={page_num}&search={search_query}"
            return f"{current_path_base}?{params}"

        if total_hits > end:
            next_url = build_paginated_url(page_number + 1)
        if start > 0:
            previous_url = build_paginated_url(page_number - 1)

        return Response(
            {
                "count": total_hits,
                "next": next_url,
                "previous": previous_url,
                "results": serializer.data,
            }
        )

    def get_summary(self, request):
        total_users = UserProfile.objects.count()
        avg_age = None
        popular_skills = []
        popular_professions = []
        top_city = None

        # ======= Средний возраст =======
        profiles_with_birthday = UserProfile.objects.exclude(bithday=None)
        if profiles_with_birthday.exists():
            from datetime import date
            ages = [
                date.today().year - p.bithday.year
                - ((date.today().month, date.today().day) < (p.bithday.month, p.bithday.day))
                for p in profiles_with_birthday
            ]
            avg_age = sum(ages) // len(ages)

        # ======= Популярные скиллы =======
        skills_counter = {}
        for p in UserProfile.objects.all():
            for skill in (p.skills or "").split(","):
                skill = skill.strip()
                if skill:
                    skills_counter[skill] = skills_counter.get(skill, 0) + 1
        popular_skills = sorted(skills_counter.items(), key=lambda x: -x[1])[:5]

        # ======= Популярные профессии =======
        professions_counter = (
            UserProfile.objects.values_list("profession", flat=True)
            .annotate(count=Count("profession"))
            .order_by("-count")
        )
        popular_professions = list(professions_counter[:5])

        # ======= Самый популярный город =======
        cities_counter = (
            UserProfile.objects.values('locations')
            .annotate(count=Count('locations'))
            .order_by('-count')
            .first()
        )
        top_city = cities_counter['locations'] if cities_counter else None

        return Response(
            {
                "total_users": total_users,
                "avg_age": avg_age,
                "popular_skills": popular_skills,
                "popular_professions": popular_professions,
                "top_city": top_city,
            }
        )

    def get(self, request):
        """
        GET с параметром ?type=recommendations|search|summary
        """
        request_type = request.query_params.get("type", "recommendations")
        if request_type == "recommendations":
            return self.get_recommendations(request)
        elif request_type == "search":
            return self.get_search(request)
        elif request_type == "summary":
            return self.get_summary(request)
        else:
            return Response({"error": "Неизвестный тип запроса"}, status=status.HTTP_400_BAD_REQUEST)

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
        return self.request.user.userprofile

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
