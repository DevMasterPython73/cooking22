from .models import Post, Category
from rest_framework import serializers


class PostSerializer(serializers.ModelSerializer):
    """Поля, которые будут отображаться в API"""

    class Meta:
        model = Post
        fields = ('title', 'category', 'created_at', 'content', 'author')


class CategorySerializer(serializers.ModelSerializer):
    """Поля, которые будут отображаться в API"""

    class Meta:
        model = Category
        fields = ('title', 'id')