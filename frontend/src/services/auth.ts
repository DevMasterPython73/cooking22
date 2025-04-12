import api from './api';

interface LoginData {
    username: string;
    password: string;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

export const authService = {
    async login(data: LoginData): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/token/', data);
        // Сохраняем токены
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        return response.data;
    },

    async refresh(): Promise<TokenResponse> {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post<TokenResponse>('/token/refresh/', {
            refresh: refreshToken
        });
        localStorage.setItem('accessToken', response.data.access);
        return response.data;
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    getAccessToken() {
        return localStorage.getItem('accessToken');
    }
};
