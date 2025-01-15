import { Navigate } from 'react-router-dom';

/**
 * PublicRoute component to redirect authenticated users away from public routes (e.g., /login).
 */
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    return token ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
