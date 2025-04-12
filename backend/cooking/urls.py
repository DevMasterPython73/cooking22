from django.urls import path, re_path
from django.views.generic import TemplateView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.views.decorators.cache import cache_page
from .views import (
    Index, ArticleByCategory, PostDetail, AddPost, PostUpdate, PostDelete,
    SearchResult, user_login, user_logout, register, add_comment, profile,
    UserChangePassword, CookingAPI, CookingAPIDetail, CookingCategoryAPI, CookingCategoryAPIDetail, HomeDataView,
    CategoryListView, PostListView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Документация по API",
      terms_of_service="http://www.google.com/policies/terms/",
      contact=openapi.Contact(email="shuckiy73@gmail.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Главная страница
    path('', Index.as_view(), name='index'),
    # path('', cache_page(60 * 15)(Index.as_view()), name='index'),  # Исправлена опечатка

    # Список статей по категории
    path('category/<int:pk>/', ArticleByCategory.as_view(), name='category_list'),

    # Детали статьи
    path('post/<int:pk>/', PostDetail.as_view(), name='post_detail'),

    # Добавление статьи
    path('add_article/', AddPost.as_view(), name='add'),

    # Обновление статьи
    path('post/<int:pk>/update/', PostUpdate.as_view(), name='post_update'),

    # Удаление статьи
    path('post/<int:pk>/delete/', PostDelete.as_view(), name='post_delete'),

    # Поиск статей
    path('search/', SearchResult.as_view(), name='search'),

    # Аутентификация пользователя
    path('login/', user_login, name='login'),

    # Выход пользователя
    path('logout/', user_logout, name='logout'),

    # Регистрация пользователя
    path('register/', register, name='register'),

    # Добавление комментария
    path('add_comment/<int:post_id>/', add_comment, name='add_comment'),

    # Профиль пользователя
    path('profile/<int:user_id>/', profile, name='profile'),

    # Смена пароля
    path('password/', UserChangePassword.as_view(), name='change_password'),

    # API для статей
    path('posts/api/', CookingAPI.as_view(), name='CookingAPI'),
    path('posts/api/<int:pk>/', CookingAPIDetail.as_view(), name='CookingAPIDetail'),

    # API для категорий
    path('categories/api/', CookingCategoryAPI.as_view(), name='CookingCategoryAPI'),
    path('categories/api/<int:pk>/', CookingCategoryAPIDetail.as_view(), name='CookingCategoryAPIDetail'),

    # JWT токены
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Swagger и Redoc
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Swagger UI
    path(
        "swagger-ui/",
        TemplateView.as_view(
            template_name="swagger-ui.html",
            extra_context={"schema_url": "openapi-schema"},
        ),
        name="swagger-ui",
    ),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=1), name='schema-json'),
    path('api/home-data/', HomeDataView.as_view(), name='home-data'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('posts/', PostListView.as_view(), name='post-list'),
]