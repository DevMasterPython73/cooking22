import React, { useState, useEffect } from 'react';
import { CategoryButton } from './CategoryButton';
import { api } from '../services/api';

interface Category {
    id: number;
    title: string;
}

export const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories/');
                setCategories(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Ошибка при загрузке категорий');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return <div>Загрузка категорий...</div>;
    }

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <div className="d-flex flex-wrap gap-2">
            {categories.map(category => (
                <CategoryButton
                    key={category.id}
                    id={category.id}
                    title={category.title}
                />
            ))}
        </div>
    );
};
