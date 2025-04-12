import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export const PasswordChangeForm: React.FC = () => {
    const [formData, setFormData] = useState({
        old_password: '',
        new_password1: '',
        new_password2: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/password/change/', formData);
            toast.success('Пароль успешно изменен');
            router.push('/profile');
        } catch (err) {
            toast.error('Ошибка при изменении пароля');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Смена пароля</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="old_password" className="form-label">Текущий пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        id="old_password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="new_password1" className="form-label">Новый пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        id="new_password1"
                        name="new_password1"
                        value={formData.new_password1}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="new_password2" className="form-label">Подтвердите новый пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        id="new_password2"
                        name="new_password2"
                        value={formData.new_password2}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Изменить пароль'}
                </button>
            </form>
        </div>
    );
}; 