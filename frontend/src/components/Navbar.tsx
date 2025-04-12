import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth'; // Мы создадим этот хук позже

export const Navbar = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${searchQuery}`);
    };

    return (
        <nav className="navbar navbar-expand-lg bg-light">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand">
                    Рецепты
                </Link>
                <div className="navbar-nav">
                    <Link href="/login" className="nav-link">
                        Войти
                    </Link>
                    <Link href="/register" className="nav-link">
                        Регистрация
                    </Link>
                </div>
            </div>
        </nav>
    );
};
