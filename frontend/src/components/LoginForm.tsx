import { useForm } from '../hooks/useForm';
import { FormErrors } from './FormErrors';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';
import { useNotifications } from '../hooks/useNotifications';

interface LoginFormData {
    username: string;
    password: string;
}

export const LoginForm = () => {
    const router = useRouter();
    const { showSuccess, showError } = useNotifications();
    const {
        formData,
        errors,
        handleChange,
        setErrors,
        clearErrors
    } = useForm<LoginFormData>({
        username: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        try {
            await authService.login(formData);
            showSuccess('Вы успешно вошли в систему!');
            router.push('/dashboard');
        } catch (error: any) {
            if (error.response?.data) {
                setErrors({
                    fieldErrors: error.response.data,
                    nonFieldErrors: error.response.data.non_field_errors
                });
            } else {
                showError('Ошибка входа. Проверьте ваши учетные данные.');
            }
        }
    };

    return (
        <>
            <h2 className="text-center">Войти в аккаунт</h2>
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

                <button type="submit" className="btn btn-dark w-100">
                    Войти
                </button>
            </form>
        </>
    );
};
