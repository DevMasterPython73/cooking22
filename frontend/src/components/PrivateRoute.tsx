import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        const token = authService.getAccessToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    return <>{children}</>;
};
