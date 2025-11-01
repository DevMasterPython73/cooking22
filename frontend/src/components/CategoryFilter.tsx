// components/CategoryFilter.tsx
import React from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  postCountByCategory: (id: number) => number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  postCountByCategory
}) => (
  <div className="card">
    <div className="card-header bg-primary text-white">Категории</div>
    <div className="list-group list-group-flush">
      <button
        className={`list-group-item list-group-item-action ${
          selectedCategoryId === null ? 'active' : ''
        }`}
        onClick={() => onSelectCategory(null)}
      >
        Все категории
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
            selectedCategoryId === category.id ? 'active' : ''
          }`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
          <span className="badge bg-primary rounded-pill">
            {postCountByCategory(category.id)}
          </span>
        </button>
      ))}
    </div>
  </div>
);
