from django.urls import path, re_path, include
from django.views.generic import TemplateView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.views.decorators.cache import cache_page
from .views import (
    Index, ArticleByCategory, PostDetail, AddPost, PostUpdate, PostDelete,
    SearchResult, user_login, user_logout, register, add_comment, profile,
    UserChangePassword, HomeDataView, PostViewSet, CategoryViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from rest_framework.routers import DefaultRouter

schema_view = get_schema_view(
   openapi.Info(
      title="Cooking API",
      default_version='v1',
      description="API для кулинарного блога",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="shuckiy73@gmail.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'api/posts', PostViewSet, basename='posts')
router.register(r'api/categories', CategoryViewSet, basename='categories')

urlpatterns = [
    # Основные URL приложения
    path('', cache_page(60 * 15)(Index.as_view()), name='index'),
    path('category/<int:pk>/', ArticleByCategory.as_view(), name='category'),
    path('post/<int:pk>/', PostDetail.as_view(), name='post_detail'),
    path('add-post/', AddPost.as_view(), name='add_post'),
    path('post/<int:pk>/update/', PostUpdate.as_view(), name='post_update'),
    path('post/<int:pk>/delete/', PostDelete.as_view(), name='post_delete'),
    path('search/', SearchResult.as_view(), name='search'),
    
    # Аутентификация и пользователи
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('register/', register, name='register'),
    path('profile/<int:user_id>/', profile, name='profile'),
    path('password-change/', UserChangePassword.as_view(), name='password_change'),
    path('post/<int:post_id>/comment/', add_comment, name='add_comment'),
    
    # API Endpoints
    path('api/home/', HomeDataView.as_view(), name='api_home'),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Документация API
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # Подключение URL от роутера
    path('', include(router.urls)),
    
    # REST Framework Auth URLs
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]