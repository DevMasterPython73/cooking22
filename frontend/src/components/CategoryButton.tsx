import React from 'react';
import { useRouter } from 'next/router';

interface CategoryButtonProps {
    id: number;
    title: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ id, title }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/category/${id}`);
    };

    return (
        <button 
            onClick={handleClick}
            className="btn btn-outline-primary mb-2"
        >
            {title}
        </button>
    );
}; 