import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component to guard private routes based on authentication.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    return token ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
