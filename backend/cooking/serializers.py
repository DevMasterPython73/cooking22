from django.db.models import Count, Q
from .models import Post, Category, Comment
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class CategorySerializer(serializers.ModelSerializer):
    """Сериализатор категорий с дополнительной статистикой"""
    post_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'title', 'description']
        read_only_fields = ['post_count']

    

class CommentSerializer(serializers.ModelSerializer):
    """Сериализатор комментариев с информацией об авторе"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'author']
        read_only_fields = ['created_at', 'author']

class PostSerializer(serializers.ModelSerializer):
    """Расширенный сериализатор постов"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_author = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'image', 
            'created_at', 'updated_at', 'author', 'category',
            'comments', 'is_published', 'watched', 'is_author'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'watched']
    
    def get_is_author(self, obj):
        """Проверка, является ли текущий пользователь автором"""
        request = self.context.get('request')
        return request and request.user == obj.author

class PostViewSet(viewsets.ModelViewSet):
    """ViewSet для постов с дополнительными действиями"""
    queryset = Post.objects.select_related('author', 'category').prefetch_related('comments')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination
    
    def perform_create(self, serializer):
        """Автоматическое назначение автора при создании"""
        serializer.save(author=self.request.user)
    
    def get_queryset(self):
        """Фильтрация постов для разных случаев"""
        queryset = super().get_queryset()
        
        # Фильтрация для анонимных пользователей
        if not self.request.user.is_authenticated:
            return queryset.filter(is_published=True)
            
        # Фильтрация для авторов
        if not self.request.user.is_staff:
            return queryset.filter(Q(is_published=True) | Q(author=self.request.user))
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Действие для публикации/снятия с публикации"""
        post = self.get_object()
        post.is_published = not post.is_published
        post.save()
        return Response({'status': 'published' if post.is_published else 'unpublished'})
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Получение похожих постов"""
        post = self.get_object()
        similar_posts = Post.objects.filter(
            category=post.category,
            is_published=True
        ).exclude(id=post.id)[:5]
        serializer = self.get_serializer(similar_posts, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet для категорий с дополнительной статистикой"""
    queryset = Category.objects.annotate(post_count=Count('posts'))  # Исправлено на 'posts'
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Получение всех постов категории"""
        category = self.get_object()
        posts = Post.objects.filter(category=category, is_published=True)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)