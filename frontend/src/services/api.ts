import axios from 'axios';
import { authService } from './auth';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 и это не повторный запрос
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Пробуем обновить токен
                const { access } = await authService.refresh();
                
                // Обновляем заголовок с новым токеном
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
                // Повторяем исходный запрос
                return api(originalRequest);
            } catch (refreshError) {
                // Если не удалось обновить токен, разлогиниваем пользователя
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;