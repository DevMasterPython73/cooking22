import { RegisterForm } from '../components/RegisterForm';

export default function Register() {
    return (
        <div className="d-flex justify-content-center">
            <div className="card col-4 mb-4 mt-4">
                <div className="card-body">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}

