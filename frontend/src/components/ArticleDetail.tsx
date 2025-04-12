import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface Comment {
    id: number;
    text: string;
    author: string;
    created_at: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    category: string;
    image: string;
    author: string;
    author_id: number;
    created_at: string;
    views: number;
}

interface RecommendedPost {
    id: number;
    title: string;
    image: string;
}

export const ArticleDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [recommendedPosts, setRecommendedPosts] = useState<RecommendedPost[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchPost();
            fetchComments();
            fetchRecommendedPosts();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await api.get(`/posts/${id}/`);
            setPost(response.data);
        } catch (err) {
            setError('Ошибка при загрузке статьи');
            toast.error('Не удалось загрузить статью');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/posts/${id}/comments/`);
            setComments(response.data);
        } catch (err) {
            toast.error('Не удалось загрузить комментарии');
        }
    };

    const fetchRecommendedPosts = async () => {
        try {
            const response = await api.get(`/posts/${id}/recommendations/`);
            setRecommendedPosts(response.data);
        } catch (err) {
            toast.error('Не удалось загрузить рекомендации');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/posts/${id}/comments/`, {
                text: newComment
            });
            setComments([...comments, response.data]);
            setNewComment('');
            toast.success('Комментарий успешно добавлен');
        } catch (err) {
            toast.error('Не удалось добавить комментарий');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Вы действительно хотите удалить эту статью?')) return;

        try {
            await api.delete(`/posts/${id}/`);
            toast.success('Статья успешно удалена');
            router.push('/');
        } catch (err) {
            toast.error('Не удалось удалить статью');
        }
    };

    const handleEdit = () => {
        router.push(`/posts/${id}/edit`);
    };

    if (isLoading) {
        return <div className="text-center">Загрузка...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!post) {
        return <div className="alert alert-warning">Статья не найдена</div>;
    }

    const isAuthor = authService.getUserId() === post.author_id;

    return (
        <div className="container">
            <div className="d-flex justify-content-between">
                <div className="col-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between">
                            {post.category}
                            <div>
                                {isAuthor && (
                                    <>
                                        <button onClick={handleDelete} className="btn btn-dark me-2">
                                            Удалить
                                        </button>
                                        <button onClick={handleEdit} className="btn btn-dark me-2">
                                            Изменить
                                        </button>
                                    </>
                                )}
                                <button onClick={() => router.back()} className="btn btn-dark">
                                    Назад
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <img 
                                src={post.image || "https://www.raumplus.ru/upload/iblock/99e/Skoro-zdes-budet-foto.jpg"} 
                                className="card-img-top mb-3" 
                                alt={post.title}
                                style={{ maxWidth: '300px' }}
                            />
                            <h5 className="card-title">{post.title}</h5>
                            <div className="card-text" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                        <div className="card-footer d-flex justify-content-between">
                            <p className="card-text">{new Date(post.created_at).toLocaleString('ru-RU')}</p>
                            <a href={`/profile/${post.author_id}`}>Автор статьи: {post.author}</a>
                            <p className="card-text">{post.views}</p>
                        </div>
                    </div>

                    <hr />

                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            className="form-control mb-2"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Текст вашего комментария"
                            rows={5}
                            required
                        />
                        <button type="submit" className="btn btn-dark">
                            Добавить комментарий
                        </button>
                    </form>

                    {comments.map((comment) => (
                        <div key={comment.id} className="card mt-2">
                            <h5 className="card-header">{comment.author}</h5>
                            <div className="card-body">
                                <p className="card-text">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-1"></div>
                <div className="col-4">
                    <h4 className="mb-3">Рекомендуемые статьи</h4>
                    {recommendedPosts.map((post) => (
                        <div key={post.id} className="card mb-3" style={{ width: '18rem' }}>
                            <img 
                                src={post.image || "https://www.raumplus.ru/upload/iblock/99e/Skoro-zdes-budet-foto.jpg"} 
                                className="card-img-top" 
                                alt={post.title}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{post.title}</h5>
                                <button 
                                    onClick={() => router.push(`/post/${post.id}`)} 
                                    className="btn btn-primary"
                                >
                                    Подробнее
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 