/**
 * Main Application Component
 * 
 * Handles routing, authentication verification, and lazy-loaded component rendering
 * Configures all application routes with proper authentication guards
 */
import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/poppins';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import API_CONFIG from './api/api';
import { setUser } from './features/auth/authSlice';

/**
 * Loading spinner component configuration
 */
const LOADER_CONFIG = {
    color: '#016E5B',
    size: 50,
};

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
    }}>
        <HashLoader color={LOADER_CONFIG.color} size={LOADER_CONFIG.size} />
    </div>
);

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    LOGIN: '/login',
    HOME: '/',
    ASSESSMENTS: '/assessments',
    BRANCH: '/branch',
    ADD_BRANCH: '/Addbranch',
    EMPLOYEE: '/employee',
    MODULE: '/module',
    SETTINGS: '/settings',
    ALL_TRAINING: '/alltraining',
    TRAINING: '/training',
    ASSIGN_DATA: '/assigdata',
    ASSIGN_TRAINING: '/assigtraining/:id',
    CREATE_MODULE: '/createmodule',
    CREATE_NEW_TRAINING: '/createnewtraining',
    REASSIGN: '/reassign/:id',
    MANDATORY_TRAINING: '/create/mandatorytraining',
    TRAINING_DETAILS: '/trainingdetails/:id',
    CREATE_ASSESSMENT: '/create/assessment',
    ASSESSMENT_ASSIGN: '/assessment/assign/:id',
    ASSIGN_ASSESSMENT: '/assign/assessment',
    NOTIFICATIONS: '/admin/Notification',
    ASSESSMENT_OVERDUE: '/admin/overdue/assessment',
    TRAINING_OVERDUE: '/admin/overdue/training',
    EMPLOYEE_DETAIL: '/detailed/:id',
    BRANCH_DETAIL: '/branch/detailed/:id',
    PROFILE: '/admin/profile',
    LOGIN_ANALYTICS: '/admin/login-analytics',
};

/**
 * Token verification API endpoint
 */
const TOKEN_VERIFICATION_ENDPOINT = 'api/admin/admin/verifyToken';

/**
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Authentication token or null
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
 * Removes authentication token from localStorage safely
 */
const removeAuthToken = () => {
    try {
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Failed to remove auth token:', error);
    }
};

/**
 * Verifies authentication token with backend
 * 
 * @param {string} token - Authentication token to verify
 * @returns {Promise<Object>} - Verification response with user data
 * @throws {Error} - If verification fails
 */
const verifyToken = async (token) => {
    const url = `${API_CONFIG.baseUrl}${TOKEN_VERIFICATION_ENDPOINT}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error(`Token verification failed: ${response.status}`);
    }
    
    return await response.json();
};

/**
 * Handles successful token verification
 * 
 * @param {Object} response - Verification response
 * @param {Function} dispatch - Redux dispatch function
 */
const handleVerificationSuccess = (response, dispatch) => {
    if (response.user) {
        dispatch(setUser({
            userId: response.user.userId,
            role: response.user.role,
        }));
    } else {
        throw new Error('No user data in token verification response');
    }
};

/**
 * Handles token verification failure
 * 
 * @param {Function} navigate - Navigation function
 */
const handleVerificationFailure = (navigate) => {
    removeAuthToken();
    navigate(ROUTE_PATHS.LOGIN);
};

/**
 * Lazy-loaded component imports for code splitting
 */
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Assessments = lazy(() => import('./pages/Assessments/Assessments'));
const Branch = lazy(() => import('./pages/Branch/Branch'));
const Employee = lazy(() => import('./pages/Employee/Employee'));
const Module = lazy(() => import('./pages/Modules/Module'));
const Training = lazy(() => import('./pages/Training/Training'));
const Setting = lazy(() => import('./pages/Setting/Setting'));
const CreateTraining = lazy(() => import('./pages/Training/CreateTraining'));
const AssignedTrainings = lazy(() => import('./pages/Training/AssignedTrainings'));
const AssingOrdelete = lazy(() => import('./pages/Training/AssingOrdelete'));
const CreateModule = lazy(() => import('./pages/Modules/createmodule/CreateModule'));
const CreateTrainings = lazy(() => import('./pages/Training/createTraining/CreateTrainings'));
const Reassign = lazy(() => import('./pages/Training/Reassign/Reassign'));
const MandatoryTraining = lazy(() => import('./pages/Training/Mandatorytraining/Mandatorytraining'));
const UserTrainingProgress = lazy(() => import('./pages/Training/UserTrainingProgress/UserTrainingProgress'));
const CreateAssessment = lazy(() => import('./pages/Assessments/CreateAssessment/CreateAssessment'));
const AssessmentsAssign = lazy(() => import('./pages/Assessments/AssessmentsAssign/AssessmentsAssign'));
const AssignAssessment = lazy(() => import('./pages/Assessments/AssignAssessment/AssignAssessment'));
const Notifications = lazy(() => import('./pages/Notification/Notifications.jsx'));
const AddBranch = lazy(() => import('./pages/Branch/AddBranch.jsx'));
const AssessmentOverDuedata = lazy(() => import('./pages/OverDue/AssessmentOverDuedata.jsx'));
const TraningOverDuedata = lazy(() => import('./pages/OverDue/TraningOverDuedata.jsx'));
const EmployeeDetaile = lazy(() => import('./pages/Employee/EmployeeDetaile/EmployeeDetaile.jsx'));
const BranchDetails = lazy(() => import('./pages/Branch/BranchDetails/BranchDetails.jsx'));
const Profile = lazy(() => import('./pages/profile/Profile.jsx'));
const LoginAnalytics = lazy(() => import('./pages/Setting/LoginAnalytics.jsx'));

/**
 * Main App Component
 * 
 * Handles authentication verification and renders application routes
 * 
 * @returns {JSX.Element} - Application component
 */
function App() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = getAuthToken();
        
        if (!token) {
            navigate(ROUTE_PATHS.LOGIN);
            return;
        }

        /**
         * Async function to verify token with backend
         */
        const performTokenVerification = async () => {
            try {
                const response = await verifyToken(token);
                handleVerificationSuccess(response, dispatch);
            } catch (error) {
                console.error('Token verification error:', error.message);
                handleVerificationFailure(navigate);
            }
        };

        performTokenVerification();
    }, [dispatch, navigate]);

    return (
        <>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path={ROUTE_PATHS.LOGIN}
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route 
                        path={ROUTE_PATHS.HOME} 
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSESSMENTS} 
                        element={
                            <ProtectedRoute>
                                <Assessments />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.BRANCH} 
                        element={
                            <ProtectedRoute>
                                <Branch />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ADD_BRANCH} 
                        element={
                            <ProtectedRoute>
                                <AddBranch />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.EMPLOYEE} 
                        element={
                            <ProtectedRoute>
                                <Employee />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.MODULE} 
                        element={
                            <ProtectedRoute>
                                <Module />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.SETTINGS} 
                        element={
                            <ProtectedRoute>
                                <Setting />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ALL_TRAINING} 
                        element={
                            <ProtectedRoute>
                                <Training />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.TRAINING} 
                        element={
                            <ProtectedRoute>
                                <CreateTraining />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSIGN_DATA} 
                        element={
                            <ProtectedRoute>
                                <AssignedTrainings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSIGN_TRAINING} 
                        element={
                            <ProtectedRoute>
                                <AssingOrdelete />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.CREATE_MODULE} 
                        element={
                            <ProtectedRoute>
                                <CreateModule />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.CREATE_NEW_TRAINING} 
                        element={
                            <ProtectedRoute>
                                <CreateTrainings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.REASSIGN} 
                        element={
                            <ProtectedRoute>
                                <Reassign />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.MANDATORY_TRAINING} 
                        element={
                            <ProtectedRoute>
                                <MandatoryTraining />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.TRAINING_DETAILS} 
                        element={
                            <ProtectedRoute>
                                <UserTrainingProgress />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.CREATE_ASSESSMENT} 
                        element={
                            <ProtectedRoute>
                                <CreateAssessment />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSESSMENT_ASSIGN} 
                        element={
                            <ProtectedRoute>
                                <AssessmentsAssign />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSIGN_ASSESSMENT} 
                        element={
                            <ProtectedRoute>
                                <AssignAssessment />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.NOTIFICATIONS} 
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.ASSESSMENT_OVERDUE} 
                        element={
                            <ProtectedRoute>
                                <AssessmentOverDuedata />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.TRAINING_OVERDUE} 
                        element={
                            <ProtectedRoute>
                                <TraningOverDuedata />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.EMPLOYEE_DETAIL} 
                        element={
                            <ProtectedRoute>
                                <EmployeeDetaile />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.BRANCH_DETAIL} 
                        element={
                            <ProtectedRoute>
                                <BranchDetails />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.PROFILE} 
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={ROUTE_PATHS.LOGIN_ANALYTICS} 
                        element={
                            <ProtectedRoute>
                                <LoginAnalytics />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Suspense>
            <ToastContainer />
        </>
    );
}

export default App;
