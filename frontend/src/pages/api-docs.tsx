import React, { useEffect } from 'react';
import Head from 'next/head';

export default function ApiDocs() {
    useEffect(() => {
        // Загрузка Swagger UI
        const script = document.createElement('script');
        script.src = '//unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js';
        script.async = true;
        document.body.appendChild(script);

        // Загрузка стилей Swagger UI
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '//unpkg.com/swagger-ui-dist@3/swagger-ui.css';
        document.head.appendChild(link);

        // Инициализация Swagger UI после загрузки скрипта
        script.onload = () => {
            const SwaggerUIBundle = (window as any).SwaggerUIBundle;
            const ui = SwaggerUIBundle({
                url: '/api/schema.yaml',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                requestInterceptor: (request: any) => {
                    // Добавление CSRF токена к запросам
                    const csrfToken = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('csrftoken='))
                        ?.split('=')[1];
                    
                    if (csrfToken) {
                        request.headers['X-CSRFToken'] = csrfToken;
                    }
                    return request;
                }
            });
        };

        return () => {
            document.body.removeChild(script);
            document.head.removeChild(link);
        };
    }, []);

    return (
        <>
            <Head>
                <title>Документация API</title>
            </Head>
            <div id="swagger-ui" className="container mt-4" />
        </>
    );
} 