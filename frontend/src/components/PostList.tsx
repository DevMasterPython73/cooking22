import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';

interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

export const PostList: React.FC = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/');
            setPosts(response.data);
        } catch (err) {
            console.error('Ошибка загрузки статей:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (isLoading) {
        return <div className="text-center">Загрузка статей...</div>;
    }

    return (
        <div>
            {posts.map(post => (
                <div key={post.id} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{post.title}</h5>
                        <p className="card-text">{truncateText(post.content)}</p>
                        <button 
                            onClick={() => router.push(`/post/${post.id}`)}
                            className="btn btn-primary"
                        >
                            Подробнее
                        </button>
                    </div>
                    <div className="card-footer text-muted">
                        {new Date(post.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
