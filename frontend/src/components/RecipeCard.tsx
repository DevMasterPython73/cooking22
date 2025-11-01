// components/RecipeCard.tsx
import React from 'react';
import { useRouter } from 'next/router';

interface RecipeCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    image: string;
    author: string;
    created_at: string;
    updated_at: string;
    views: number;
    categoryName: string;
  };
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ post }) => {
  const router = useRouter();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-light">
        <span className="badge bg-secondary">{post.categoryName}</span>
      </div>
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={post.image || '/placeholder-recipe.jpg'}
            className="img-fluid rounded-start h-100 object-fit-cover"
            alt={post.title}
            style={{ maxHeight: '200px', width: '100%' }}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{post.title}</h5>
            <p className="card-text text-muted">{post.content.substring(0, 150)}...</p>
            <div className="d-flex justify-content-between align-items-center">
              <button
                onClick={() => router.push(`/post/${post.id}`)}
                className="btn btn-outline-primary"
              >
                Читать далее
              </button>
              <small className="text-muted">{formatDate(post.created_at)}</small>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer bg-transparent d-flex justify-content-between">
        <small className="text-muted">Автор: {post.author || 'Аноним'}</small>
        <small className="text-muted">Просмотров: {post.views}</small>
        {post.created_at !== post.updated_at && (
          <small className="text-muted">Обновлено: {formatDate(post.updated_at)}</small>
        )}
      </div>
    </div>
  );
};
