import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';

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
    views: number;
}

export const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (err) {
            console.error('Ошибка загрузки категорий:', err);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/');
            setPosts(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Ошибка загрузки статей:', err);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center">Загрузка...</div>;
    }

    return (
        <div className="container">
            <h2 className="mb-4">Кулинарный портал</h2>
            <div className="d-flex justify-content-between">
                <div className="col-3">
                    <div className="list-group">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => router.push(`/category/${category.slug}`)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-8">
                    {posts.map(post => (
                        <div key={post.id} className="card mb-4">
                            <div className="card-header">
                                {post.category}
                            </div>
                            <div className="card-body">
                                <img 
                                    src={post.image || "https://www.raumplus.ru/upload/iblock/99e/Skoro-zdes-budet-foto.jpg"} 
                                    className="card-img-top mb-3" 
                                    alt={post.title}
                                    style={{ maxWidth: '300px' }}
                                />
                                <h5 className="card-title">{post.title}</h5>
                                <p className="card-text">{post.content.substring(0, 200)}...</p>
                                <button 
                                    onClick={() => router.push(`/post/${post.id}`)}
                                    className="btn btn-primary"
                                >
                                    Читать далее
                                </button>
                            </div>
                            <div className="card-footer d-flex justify-content-between">
                                <small className="text-muted">
                                    {new Date(post.created_at).toLocaleString('ru-RU')}
                                </small>
                                <small className="text-muted">
                                    Автор: {post.author}
                                </small>
                                <small className="text-muted">
                                    Просмотров: {post.views}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 