import { useState } from 'react';
import { authService } from '../services/auth';
import { useRouter } from 'next/router';

export const LoginForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.login(formData);
            router.push('/dashboard'); // Редирект после успешного входа
        } catch (err) {
            setError('Неверные учетные данные');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Имя пользователя:</label>
                <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({
                        ...formData,
                        username: e.target.value
                    })}
                />
            </div>
            <div>
                <label>Пароль:</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({
                        ...formData,
                        password: e.target.value
                    })}
                />
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button type="submit">Войти</button>
        </form>
    );
};
