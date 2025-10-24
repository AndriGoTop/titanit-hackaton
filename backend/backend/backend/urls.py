from django.contrib import admin
from django.urls import path, include , re_path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest.views import UserViewSet, UserRegisterView, ProfileViewSet
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = routers.SimpleRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"profile", ProfileViewSet, basename="profile")


schema_view = get_schema_view(
    openapi.Info(
        title="TaskHub API",
        default_version="v1",
        description="Документация API для фронтендеров и разработчиков",
        contact=openapi.Contact(email="backend@taskhub.dev"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Документация API
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("api/", include(router.urls)),
    path("api/register/", UserRegisterView.as_view(), name="register"),
    # endpoimt для аунтификации пользователя через JWT токены
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    path("api/profile/", include(router.urls), name="profile"),
    # аккаунты пользователей
    re_path(r"^auth/", include("djoser.urls.jwt")),
]
