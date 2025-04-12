import axios from 'axios';
import { authService } from './auth';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = await authService.refresh();
                originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getCategories = async () => {
    const response = await api.get('/categories/api/');
    return response.data;
};

export const getPosts = async () => {
    const response = await api.get('/posts/api/');
    return response.data;
};

export { api };