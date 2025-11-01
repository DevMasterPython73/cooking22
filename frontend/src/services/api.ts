// services/api.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from 'axios';
import { authService } from './auth';
import { Category, Post } from '@/types';

// Создаем экземпляр axios с базовыми настройками
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Тип для конфигурации с повторной попыткой
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await authService.refresh();
        if (tokens?.access) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
      }

      authService.logout();
      window.location.href = '/login?session_expired=true';
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      authService.logout();
      window.location.href = '/login?access_denied=true';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Обработка ошибок
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const { response, config } = error;

    const errorDetails = {
      status: response?.status,
      message: error.message,
      url: config?.url,
      data: response?.data,
    };

    console.error('API Error:', errorDetails);

    throw new Error(
      response?.data?.message || `API Request failed: ${error.message}`
    );
  }

  console.error('Unexpected Error:', error);
  throw new Error('An unexpected error occurred');
}

// API функции
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/api/categories/');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get('/api/posts/');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Экспортируем api
export { api };
