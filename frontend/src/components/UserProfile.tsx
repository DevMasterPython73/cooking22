import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { authService } from '../services/auth';
import Link from 'next/link';

interface Profile {
    job_title: string;
    location: string;
    website: string;
    github: string;
    instagram: string;
    facebook: string;
    phone: string;
    mobile: string;
    address: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: Profile;
}

interface Post {
    id: number;
    title: string;
    watched: number;
}

export const UserProfile: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isOwnProfile = authService.getUserId() === Number(id);

    useEffect(() => {
        if (id) {
            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        try {
            const [userResponse, postsResponse] = await Promise.all([
                api.get(`/users/${id}/`),
                api.get(`/users/${id}/posts/`)
            ]);
            setUser(userResponse.data);
            setPosts(postsResponse.data);
        } catch (err) {
            console.error('Ошибка загрузки данных пользователя:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center">Загрузка...</div>;
    }

    if (!user) {
        return <div className="alert alert-danger">Пользователь не найден</div>;
    }

    return (
        <div className="container">
            <div className="main-body">
                <div className="row gutters-sm">
                    <div className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex flex-column align-items-center text-center">
                                    <img 
                                        src="https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png" 
                                        alt="Аватар" 
                                        className="rounded-circle" 
                                        width="150"
                                    />
                                    <div className="mt-3">
                                        <h4>{user.username}</h4>
                                        <p className="text-secondary mb-1">{user.profile.job_title}</p>
                                        <p className="text-muted font-size-sm">{user.profile.location}</p>
                                        {!isOwnProfile && (
                                            <>
                                                <button className="btn btn-primary me-2">Подписаться</button>
                                                <button className="btn btn-outline-primary">Сообщение</button>
                                            </>
                                        )}
                                    </div>
                                    {isOwnProfile && (
                                        <Link href="/change-password" className="dropdown-item">
                                            Изменить пароль
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card mt-3">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <h6 className="mb-0">Веб-сайт</h6>
                                    <span className="text-secondary">{user.profile.website || 'Не указан'}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <h6 className="mb-0">GitHub</h6>
                                    <span className="text-secondary">{user.profile.github || 'Не указан'}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <h6 className="mb-0">Instagram</h6>
                                    <span className="text-secondary">{user.profile.instagram || 'Не указан'}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <h6 className="mb-0">Facebook</h6>
                                    <span className="text-secondary">{user.profile.facebook || 'Не указан'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Полное имя</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        {user.first_name} {user.last_name}
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Email</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        {user.email}
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Телефон</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        {user.profile.phone || 'Не указан'}
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Мобильный</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        {user.profile.mobile || 'Не указан'}
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-sm-3">
                                        <h6 className="mb-0">Адрес</h6>
                                    </div>
                                    <div className="col-sm-9 text-secondary">
                                        {user.profile.address || 'Не указан'}
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <>
                                        <hr />
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <button 
                                                    className="btn btn-info"
                                                    onClick={() => router.push('/profile/edit')}
                                                >
                                                    Редактировать
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <h4 className="mb-3">Статьи автора</h4>
                        {posts.map(post => (
                            <div key={post.id} className="card p-3 mb-2">
                                <div className="d-flex justify-content-between">
                                    <div className="card-text">{post.title}</div>
                                    <div className="d-flex gap-2">
                                        <div>Просмотры: {post.watched}</div>
                                        {isOwnProfile && (
                                            <>
                                                <button 
                                                    className="btn btn-light"
                                                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                                                >
                                                    <i className="fa-solid fa-pen-to-square fs-5"></i> Изменить
                                                </button>
                                                <button 
                                                    className="btn btn-light"
                                                    onClick={() => router.push(`/posts/${post.id}/delete`)}
                                                >
                                                    <i className="fa-solid fa-xmark fs-5"></i> Удалить
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 