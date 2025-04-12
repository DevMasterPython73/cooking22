import { LoginForm } from '../components/LoginForm';

export default function Login() {
    return (
        <div className="d-flex justify-content-center">
            <div className="card col-4 mb-4 mt-4">
                <div className="card-body">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
