from django.contrib import admin
from django.urls import path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest.views import UserViewSet


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
    
    # пользователи
    path("users/", UserViewSet.as_view()),
]
