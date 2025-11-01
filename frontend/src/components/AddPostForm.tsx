import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '../hooks/useNotifications';
import { fetchCategories } from '../services/api';
import { Category } from '../types';

interface PostFormData {
  title: string;
  content: string;
  photo: File | null;
  category: number | ''; // category id
}

export const AddPostForm = () => {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    photo: null,
    category: '',
  });

  const isEdit = router.pathname.includes('update');
  const postId = router.query.id as string | undefined;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showError('Ошибка загрузки категорий');
      }
    };

    const loadPost = async () => {
      if (isEdit && postId) {
        try {
          const response = await fetch(`/api/posts/${postId}/`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const data = await response.json();
          setFormData({
            title: data.title,
            content: data.content,
            photo: null,
            category: data.category.id,
          });
        } catch (error) {
          console.error('Error fetching post:', error);
          showError('Ошибка загрузки статьи');
        }
      }
    };

    loadCategories();
    loadPost();
  }, [isEdit, postId, showError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'category' ? Number(value) || '' : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        photo: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        photo: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category', formData.category.toString());
    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }

    try {
      const url = isEdit ? `/api/posts/${postId}/update/` : '/api/posts/create/';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        showSuccess(isEdit ? 'Статья успешно обновлена!' : 'Статья успешно добавлена!');
        router.push('/');
      } else {
        throw new Error(isEdit ? 'Ошибка при обновлении статьи' : 'Ошибка при добавлении статьи');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(isEdit ? 'Ошибка при обновлении статьи' : 'Ошибка при добавлении статьи');
    }
  };

  return (
    <>
      <h2 className="text-center">{isEdit ? 'Изменение статьи' : 'Добавление новой статьи'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Заголовок статьи:
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={255}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Текст статьи:
          </label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="photo" className="form-label">
            Изображение:
          </label>
          <input
            type="file"
            className="form-control"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Категория:
          </label>
          <select
            className="form-control"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">---------</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-dark">
          {isEdit ? 'Изменить статью' : 'Добавить статью'}
        </button>
      </form>
    </>
  );
};
