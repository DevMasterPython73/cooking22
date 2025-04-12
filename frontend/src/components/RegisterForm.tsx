import { useForm } from '../hooks/useForm';
import { FormErrors } from './FormErrors';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';
import { useNotifications } from '../hooks/useNotifications';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

export const RegisterForm = () => {
    const router = useRouter();
    const { showSuccess, showError } = useNotifications();
    const {
        formData,
        errors,
        handleChange,
        setErrors,
        clearErrors
    } = useForm<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        try {
            await authService.register(formData);
            showSuccess('Регистрация успешна! Теперь вы можете войти.');
            router.push('/login');
        } catch (error: any) {
            if (error.response?.data) {
                setErrors({
                    fieldErrors: error.response.data,
                    nonFieldErrors: error.response.data.non_field_errors
                });
            } else {
                showError('Произошла ошибка при регистрации');
            }
        }
    };

    return (
        <>
            <h2 className="text-center">Регистрация аккаунта</h2>
            <form onSubmit={handleSubmit}>
                <FormErrors errors={errors} />
                
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                        Имя пользователя
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Пароль
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password2" className="form-label">
                        Подтверждение пароля
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password2"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                    Регистрация
                </button>
            </form>
        </>
    );
};
