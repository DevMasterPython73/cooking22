import { PrivateRoute } from '../components/PrivateRoute';

export default function Dashboard() {
    return (
        <PrivateRoute>
            <div>
                {/* Защищенный контент */}
                <h1>Панель управления</h1>
            </div>
        </PrivateRoute>
    );
}
