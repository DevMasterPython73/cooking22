import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Layout } from '../components/Layout';
import { MessageProvider } from '../context/MessageContext';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isProtectedRoute = router.pathname === '/add' || router.pathname.includes('/update');

    useEffect(() => {
        // Импортируем Bootstrap JS только на клиенте
        if (typeof window !== 'undefined') {
            require('bootstrap/dist/js/bootstrap.bundle.min.js');
        }

        if (isProtectedRoute && !authService.getAccessToken()) {
            router.push('/login');
        }
    }, [isProtectedRoute, router]);

    return (
        <MessageProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </MessageProvider>
    );
}

export default MyApp;
