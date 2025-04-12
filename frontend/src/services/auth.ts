import axios from 'axios';

interface LoginData {
    username: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

class AuthService {
    private static instance: AuthService;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private userId: number | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
            this.userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null;
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async login(data: LoginData): Promise<TokenResponse> {
        const response = await axios.post('/api/token/', data);
        this.setTokens(response.data);
        return response.data;
    }

    public async register(data: RegisterData): Promise<void> {
        await axios.post('/api/register/', data);
    }

    public async refresh(): Promise<TokenResponse> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        const response = await axios.post('/api/token/refresh/', {
            refresh: this.refreshToken
        });
        this.setTokens(response.data);
        return response.data;
    }

    public logout(): void {
        this.accessToken = null;
        this.refreshToken = null;
        this.userId = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
        }
    }

    public getAccessToken(): string | null {
        return this.accessToken;
    }

    public getUserId(): number | null {
        return this.userId;
    }

    private setTokens(data: TokenResponse): void {
        this.accessToken = data.access;
        this.refreshToken = data.refresh;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            
            // Decode the access token to get user ID
            const payload = JSON.parse(atob(data.access.split('.')[1]));
            this.userId = payload.user_id;
            localStorage.setItem('userId', payload.user_id.toString());
        }
    }
}

export const authService = AuthService.getInstance();
