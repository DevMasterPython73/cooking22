from .models import Post, Category
from rest_framework import serializers


class PostSerializer(serializers.ModelSerializer):
    """Поля, которые будут отображаться в API"""

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'image', 'created_at', 'author']


class CategorySerializer(serializers.ModelSerializer):
    """Поля, которые будут отображаться в API"""

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']