from django.shortcuts import render, get_object_or_404, redirect
from .models import Category, Post, Comment
from django.db.models import F, Q
from .forms import PostAddForm, LoginForm, RegistrationForm, CommentForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.views.generic import ListView, DetailView, CreateView, DeleteView, UpdateView
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from django.contrib.auth.views import PasswordChangeView
from .serializers import PostSerializer, CategorySerializer
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserChangePassword(PasswordChangeView):
    """Смена пароля пользователя"""
    template_name = 'cooking/password_change_form.html'
    success_url = reverse_lazy('index')


class Index(ListView):
    """Главная страница с постами"""
    model = Post
    context_object_name = 'posts'
    template_name = 'cooking/index.html'
    extra_context = {'title': 'Главная страница'}
    paginate_by = 10


class ArticleByCategory(Index):
    """Фильтрация постов по категории"""
    def get_queryset(self):
        return Post.objects.filter(category_id=self.kwargs['pk'], is_published=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category = Category.objects.get(pk=self.kwargs['pk'])
        context['title'] = category.title
        return context


class PostDetail(DetailView):
    """Детальная страница поста"""
    model = Post
    template_name = 'cooking/article_detail.html'
    context_object_name = 'post'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        Post.objects.filter(pk=self.kwargs['pk']).update(watched=F('watched') + 1)
        post = context['post']
        context['title'] = post.title
        context['ext_posts'] = Post.objects.exclude(pk=self.kwargs['pk']).order_by('-watched')[:5]
        context['comments'] = Comment.objects.filter(post=post)
        if self.request.user.is_authenticated:
            context['comment_form'] = CommentForm()
        return context


class AddPost(LoginRequiredMixin, CreateView):
    """Добавление нового поста"""
    form_class = PostAddForm
    template_name = 'cooking/article_add_form.html'
    extra_context = {'title': 'Добавить статью'}
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class PostUpdate(LoginRequiredMixin, UpdateView):
    """Редактирование поста"""
    model = Post
    form_class = PostAddForm
    template_name = 'cooking/article_add_form.html'
    success_url = reverse_lazy('index')

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.author != self.request.user and not self.request.user.is_superuser:
            messages.error(request, "Вы не можете редактировать этот пост")
            return redirect('post_detail', pk=obj.pk)
        return super().dispatch(request, *args, **kwargs)


class PostDelete(LoginRequiredMixin, DeleteView):
    """Удаление поста"""
    model = Post
    success_url = reverse_lazy('index')
    context_object_name = 'post'
    extra_context = {'title': 'Удалить статью'}

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.author != self.request.user and not self.request.user.is_superuser:
            messages.error(request, "Вы не можете удалить этот пост")
            return redirect('post_detail', pk=obj.pk)
        return super().dispatch(request, *args, **kwargs)


class SearchResult(Index):
    """Поиск постов"""
    def get_queryset(self):
        word = self.request.GET.get('q')
        return Post.objects.filter(
            Q(title__icontains=word) | Q(content__icontains=word),
            is_published=True
        )


class HomeDataView(APIView):
    """API для главной страницы"""
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        posts = Post.objects.filter(is_published=True)
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с постами"""
    queryset = Post.objects.filter(is_published=True)
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Получение комментариев к посту"""
        post = self.get_object()
        comments = Comment.objects.filter(post=post)
        return Response(CommentSerializer(comments, many=True).data)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с категориями"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Получение постов категории"""
        category = self.get_object()
        posts = Post.objects.filter(category=category, is_published=True)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


# Остальные функции остаются без изменений
def add_comment(request, post_id):
    """Добавление комментария"""
    post = get_object_or_404(Post, pk=post_id)
    if request.method == 'POST':
        form = CommentForm(data=request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post
            comment.save()
            messages.success(request, 'Ваш комментарий успешно добавлен')
            return redirect('post_detail', post_id)
    else:
        form = CommentForm()

    context = {
        'post': post,
        'form': form,
    }
    return render(request, 'cooking/add_comment.html', context)


def user_login(request):
    """Авторизация пользователя"""
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None and user.is_active:
                login(request, user)
                messages.success(request, 'Вы успешно вошли в аккаунт')
                return redirect('index')
            else:
                messages.error(request, 'Неверный логин или пароль')
    else:
        form = LoginForm()

    context = {
        'title': 'Авторизация пользователя',
        'form': form
    }
    return render(request, 'cooking/login_form.html', context)


def user_logout(request):
    """Выход пользователя"""
    logout(request)
    return redirect('index')


def register(request):
    """Регистрация пользователя"""
    if request.method == 'POST':
        form = RegistrationForm(data=request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Регистрация прошла успешно. Войдите в систему.')
            return redirect('login')
    else:
        form = RegistrationForm()

    context = {
        'title': 'Регистрация пользователя',
        'form': form
    }
    return render(request, 'cooking/register_form.html', context)


def profile(request, user_id):
    """Профиль пользователя"""
    user = get_object_or_404(User, pk=user_id)
    posts = Post.objects.filter(author=user, is_published=True)
    context = {
        'user': user,
        'posts': posts
    }
    return render(request, 'cooking/profile.html', context)


class SwaggerApiDoc(TemplateView):
    """Документация API"""
    template_name = 'swagger/swagger_ui.html'
    extra_context = {
        'schema_url': 'openapi-schema'
    }