import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { fetchCategories, fetchPosts } from '../services/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string;
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
}

export const HomePage: React.FC = () => {
  const [state, setState] = useState({
    categories: [] as Category[],
    posts: [] as Post[],
    isLoading: true,
    error: null as string | null,
    authError: false
  });

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null, authError: false }));
        
        const [categories, posts] = await Promise.all([
          fetchCategories(),
          fetchPosts()
        ]);
        
        setState({
          categories,
          posts,
          isLoading: false,
          error: null,
          authError: false
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              authError: true,
              error: 'Доступ запрещен. Требуется авторизация.'
            }));
            // Перенаправление через 3 секунды
            setTimeout(() => router.push('/login'), 3000);
            return;
          }
        }
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Не удалось загрузить данные'
        }));
      }
    };

    loadData();
  }, [router]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('ru-RU', options);
  };

  if (state.isLoading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (state.authError) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-warning">
          {state.error || 'Требуется авторизация. Перенаправляем на страницу входа...'}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Кулинарный портал</h2>
      
      <div className="row">
        {/* Боковая панель с категориями */}
        <div className="col-md-3 mb-4 mb-md-0">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Категории
            </div>
            <div className="list-group list-group-flush">
              {state.categories.map(category => (
                <button
                  key={category.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => router.push(`/category/${category.slug}`)}
                >
                  {category.name}
                  <span className="badge bg-primary rounded-pill">
                    {state.posts.filter(p => p.category === category.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Основной контент с постами */}
        <div className="col-md-9">
          {state.posts.length === 0 ? (
            <div className="alert alert-info">
              Пока нет ни одной статьи. Будьте первым, кто добавит рецепт!
            </div>
          ) : (
            state.posts.map(post => (
              <div key={post.id} className="card mb-4 shadow-sm">
                <div className="card-header bg-light">
                  <span className="badge bg-secondary">{post.category}</span>
                </div>
                <div className="row g-0">
                  <div className="col-md-4">
                    <img
                      src={post.image || "/placeholder-recipe.jpg"}
                      className="img-fluid rounded-start h-100 object-fit-cover"
                      alt={post.title}
                      style={{ maxHeight: '200px', width: '100%' }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{post.title}</h5>
                      <p className="card-text text-muted">
                        {post.content.substring(0, 150)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          onClick={() => router.push(`/post/${post.id}`)}
                          className="btn btn-outline-primary"
                        >
                          Читать далее
                        </button>
                        <small className="text-muted">
                          {formatDate(post.created_at)}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-between">
                  <small className="text-muted">
                    Автор: {post.author || 'Аноним'}
                  </small>
                  <small className="text-muted">
                    Просмотров: {post.views}
                  </small>
                  {post.created_at !== post.updated_at && (
                    <small className="text-muted">
                      Обновлено: {formatDate(post.updated_at)}
                    </small>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};