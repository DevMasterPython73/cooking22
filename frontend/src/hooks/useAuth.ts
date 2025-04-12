import { useState } from 'react';
import { authService } from '../services/auth';

interface User {
    id: number;
    username: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return { user, setUser, logout };
};
