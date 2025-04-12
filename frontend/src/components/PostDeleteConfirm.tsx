import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';

interface Post {
    id: number;
    title: string;
    author_id: number;
}

export const PostDeleteConfirm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await api.get(`/posts/${id}/`);
            const postData = response.data;
            setPost(postData);
            
            // Проверяем, является ли текущий пользователь автором статьи
            const currentUserId = authService.getUserId();
            setIsAuthorized(currentUserId === postData.author_id);
            
            if (currentUserId !== postData.author_id) {
                toast.error('У вас нет прав для удаления этой статьи');
                router.push(`/post/${id}`);
            }
        } catch (err) {
            toast.error('Не удалось загрузить статью');
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isAuthorized) return;

        try {
            await api.delete(`/posts/${id}/`);
            toast.success('Статья успешно удалена');
            router.push('/');
        } catch (err) {
            toast.error('Не удалось удалить статью');
        }
    };

    if (isLoading) {
        return <div className="text-center">Загрузка...</div>;
    }

    if (!post) {
        return <div className="alert alert-danger">Статья не найдена</div>;
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Удаление статьи</h1>
            <p className="mb-4">
                Вы действительно хотите удалить статью с названием: "{post.title}"?
            </p>
            <div className="d-flex gap-2">
                <button 
                    onClick={handleDelete}
                    className="btn btn-danger"
                >
                    Да, удалить
                </button>
                <button 
                    onClick={() => router.back()}
                    className="btn btn-dark"
                >
                    Назад
                </button>
            </div>
        </div>
    );
}; 