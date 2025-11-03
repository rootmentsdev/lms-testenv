/**
 * Public Route Component
 * 
 * Redirects authenticated users away from public routes (e.g., login page)
 * Only shows content to unauthenticated users
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactNode} - Rendered children or redirect to home
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
 * Home route path constant
 */
const HOME_ROUTE = '/';

const PublicRoute = ({ children }) => {
    const token = getAuthToken();

    if (token) {
        return <Navigate to={HOME_ROUTE} replace />;
    }

    return children;
};

export default PublicRoute;
