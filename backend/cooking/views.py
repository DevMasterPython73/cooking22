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
from rest_framework.permissions import IsAuthenticated
from django.views.generic import TemplateView
from rest_framework.views import APIView  # Добавлен импорт APIView
from rest_framework.response import Response  # Добавлен импорт Response
from rest_framework import status  # Добавлен импорт status


class UserChangePassword(PasswordChangeView):
    """Простой способ смены пароля"""
    template_name = 'cooking/password_change_form.html'
    success_url = reverse_lazy('index')


class Index(ListView):
    """Главная страница с постами"""
    model = Post
    context_object_name = 'posts'
    template_name = 'cooking/index.html'
    extra_context = {'title': 'Главная страница'}


class ArticleByCategory(Index):
    """Реакция на нажатие кнопки категории"""
    def get_queryset(self):
        """Фильтрация постов по категории"""
        return Post.objects.filter(category_id=self.kwargs['pk'], is_published=True)

    def get_context_data(self, **kwargs):
        """Добавление динамических данных в контекст"""
        context = super().get_context_data(**kwargs)
        category = Category.objects.get(pk=self.kwargs['pk'])
        context['title'] = category.title
        return context


class PostDetail(DetailView):
    """Страница деталей статьи"""
    model = Post
    template_name = 'cooking/article_detail.html'
    context_object_name = 'post'

    def get_context_data(self, **kwargs):
        """Добавление динамических данных в контекст"""
        context = super().get_context_data(**kwargs)
        Post.objects.filter(pk=self.kwargs['pk']).update(watched=F('watched') + 1)
        post = context['post']
        context['title'] = post.title
        context['ext_posts'] = Post.objects.exclude(pk=self.kwargs['pk']).order_by('-watched')[:5]
        context['comments'] = Comment.objects.filter(post=post)
        if self.request.user.is_authenticated:
            context['comment_form'] = CommentForm()
        return context


class AddPost(CreateView):
    """Добавление статьи без админки"""
    form_class = PostAddForm
    template_name = 'cooking/article_add_form.html'
    extra_context = {'title': 'Добавить статью'}
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class PostUpdate(UpdateView):
    """Изменение статьи по кнопке"""
    model = Post
    form_class = PostAddForm
    template_name = 'cooking/article_add_form.html'
    success_url = reverse_lazy('index')


class PostDelete(DeleteView):
    """Удаление статьи"""
    model = Post
    success_url = reverse_lazy('index')
    context_object_name = 'post'
    extra_context = {'title': 'Изменить статью'}


class SearchResult(Index):
    """Поиск слова в заголовках или в содержании статей"""
    def get_queryset(self):
        """Фильтрация постов по поисковому запросу"""
        word = self.request.GET.get('q')
        posts = Post.objects.filter(
            Q(title__icontains=word) | Q(content__icontains=word))
        return posts


class HomeDataView(APIView):
    """API представление для главной страницы"""
    def get(self, request):
        """Получение данных для главной страницы"""
        items = Post.objects.all()  # Замените YourModel на Post или нужную модель
        serializer = PostSerializer(items, many=True)  # Замените YourModelSerializer на нужный сериализатор
        return Response(serializer.data, status=status.HTTP_200_OK)


def add_comment(request, post_id):
    """Добавление комментария к статье"""
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
    """Аутентификация пользователя"""
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
            return redirect('login')
    else:
        form = RegistrationForm()

    context = {
        'title': 'Регистрация пользователя',
        'form': form
    }

    return render(request, 'cooking/register_form.html', context)


def profile(request, user_id):
    """Страница пользователя"""
    user = get_object_or_404(User, pk=user_id)
    posts = Post.objects.filter(author=user)
    context = {
        'user': user,
        'posts': posts
    }
    return render(request, 'cooking/profile.html', context)


class CookingAPI(ListAPIView):
    """Выдача всех статей по API"""
    queryset = Post.objects.filter(is_published=True)
    serializer_class = PostSerializer


class CookingAPIDetail(RetrieveAPIView):
    """Выдача статьи по API"""
    queryset = Post.objects.filter(is_published=True)
    serializer_class = PostSerializer
    permission_classes = (IsAuthenticated,)


class CookingCategoryAPI(ListAPIView):
    """Выдача всех статей по API"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CookingCategoryAPIDetail(RetrieveAPIView):
    """Выдача статьи по API"""
    queryset = Post.objects.filter(is_published=True)
    serializer_class = CategorySerializer


class SwaggerApiDoc(TemplateView):
    """Документация API"""
    template_name = 'swagger/swagger_ui.html'
    extra_context = {
        'schema_url': 'openapi-schema'
    }