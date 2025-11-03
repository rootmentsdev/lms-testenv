/**
 * Protected Route Component
 * 
 * Guards private routes by checking for authentication token
 * Redirects to login page if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - Rendered children or redirect to login
 */
import { Navigate } from 'react-router-dom';

/**
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Token if exists, null otherwise
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve auth token:', error);
        return null;
    }
};

/**
 * Login route path constant
 */
const LOGIN_ROUTE = '/login';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();

    if (!token) {
        return <Navigate to={LOGIN_ROUTE} replace />;
    }

    return children;
};

export default ProtectedRoute;
