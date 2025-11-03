/**
 * Side Navigation Component
 * 
 * Provides main navigation menu with expandable sidebar
 * Includes dashboard, employee, training, assessment, module, branch, and settings links
 * Shows logout confirmation modal
 * 
 * @returns {JSX.Element} - Side navigation component
 */
import { useState, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
    MdModelTraining, 
    MdOutlineStoreMallDirectory, 
    MdOutlineTopic, 
    MdOutlineAssessment 
} from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { FaRegIdCard } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

import LogoutConfirmation from "../LogoutConfirmation/LogoutConfirmation";
import { logout } from "../../features/auth/authSlice";

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    HOME: '/',
    EMPLOYEE: '/employee',
    TRAINING: '/training',
    ASSIGN_DATA: '/assigdata',
    ALL_TRAINING: '/alltraining',
    CREATE_NEW_TRAINING: '/createnewtraining',
    MANDATORY_TRAINING: '/create/mandatorytraining',
    ASSESSMENTS: '/assessments',
    MODULE: '/module',
    BRANCH: '/branch',
    ADD_BRANCH: '/Addbranch',
    SETTINGS: '/settings',
    LOGIN: '/login',
};

/**
 * User role constant for super admin
 */
const SUPER_ADMIN_ROLE = 'super_admin';

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
 * Side Navigation Component
 */
const SideNav = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    /**
     * Checks if a route path is currently active
     * 
     * @param {string|string[]} paths - Single path or array of paths to check
     * @returns {boolean} - True if any path is active
     */
    const isActive = useCallback((paths) => {
        const pathsArray = Array.isArray(paths) ? paths : [paths];
        return pathsArray.some(path => location.pathname === path);
    }, [location.pathname]);

    /**
     * Handles logout button click
     * Opens logout confirmation modal
     */
    const handleLogoutClick = useCallback(() => {
        setShowLogoutConfirmation(true);
    }, []);

    /**
     * Handles logout confirmation
     * Removes token, dispatches logout action, and redirects to login
     */
    const handleLogoutConfirm = useCallback(() => {
        removeAuthToken();
        dispatch(logout());
        navigate(ROUTE_PATHS.LOGIN);
    }, [dispatch, navigate]);

    /**
     * Gets active class name for navigation items
     * 
     * @param {string|string[]} paths - Paths to check for active state
     * @returns {string} - CSS class names
     */
    const getActiveClassName = (paths) => {
        return isActive(paths) 
            ? 'bg-[#016E5B] text-white' 
            : '';
    };

    /**
     * Navigation item configuration
     */
    const navigationItems = [
        {
            path: ROUTE_PATHS.HOME,
            label: 'Dashboard',
            icon: DashboardIcon,
            activePaths: [ROUTE_PATHS.HOME],
        },
        {
            path: ROUTE_PATHS.EMPLOYEE,
            label: 'Employee',
            icon: FaRegIdCard,
            activePaths: [ROUTE_PATHS.EMPLOYEE],
        },
        {
            path: ROUTE_PATHS.TRAINING,
            label: 'Trainings',
            icon: MdModelTraining,
            activePaths: [
                ROUTE_PATHS.TRAINING,
                ROUTE_PATHS.ASSIGN_DATA,
                ROUTE_PATHS.ALL_TRAINING,
                ROUTE_PATHS.CREATE_NEW_TRAINING,
                ROUTE_PATHS.MANDATORY_TRAINING,
            ],
        },
        {
            path: ROUTE_PATHS.ASSESSMENTS,
            label: 'Assessments',
            icon: MdOutlineAssessment,
            activePaths: [ROUTE_PATHS.ASSESSMENTS],
        },
        {
            path: ROUTE_PATHS.MODULE,
            label: 'Module',
            icon: MdOutlineTopic,
            activePaths: [ROUTE_PATHS.MODULE],
        },
        {
            path: ROUTE_PATHS.BRANCH,
            label: 'Branch',
            icon: MdOutlineStoreMallDirectory,
            activePaths: [ROUTE_PATHS.BRANCH, ROUTE_PATHS.ADD_BRANCH],
        },
    ];

    /**
     * Dashboard icon SVG component
     */
    function DashboardIcon() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1m0 12h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1m10-4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1m0-8h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1"
                />
            </svg>
        );
    }

    /**
     * Renders a navigation link item
     * 
     * @param {Object} item - Navigation item configuration
     * @returns {JSX.Element} - Navigation link element
     */
    const renderNavItem = (item) => {
        const Icon = item.icon;
        
        return (
            <Link to={item.path} key={item.path}>
                <div 
                    className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500 ${getActiveClassName(item.activePaths)}`}
                >
                    <Icon className="text-xl" />
                    <div className="hidden lg:group-hover:block">{item.label}</div>
                </div>
            </Link>
        );
    };

    return (
        <div className="fixed hidden md:flex top-36 z-40 left-5 bg-[#F4F4F4] items-center rounded-2xl flex-col transition-all md:w-[90px] group lg:w-[90px] lg:hover:w-64 duration-500">
            {/* Navigation Links */}
            <div className="mt-5 mb-5 flex flex-col text-md lg:group-hover:w-56 text-black space-y-6">
                {navigationItems.map(renderNavItem)}

                {/* Settings Section - Only for Super Admin */}
                {user?.role === SUPER_ADMIN_ROLE && (
                    <Link to={ROUTE_PATHS.SETTINGS}>
                        <div 
                            className={`flex justify-center lg:justify-start items-center space-x-4 p-2 rounded-lg transition-all duration-500 ${getActiveClassName([ROUTE_PATHS.SETTINGS])}`}
                        >
                            <IoSettingsOutline className="text-xl" />
                            <div className="hidden lg:group-hover:block">Settings</div>
                        </div>
                    </Link>
                )}

                {/* Logout Section */}
                <div 
                    className="flex justify-center lg:justify-start cursor-pointer items-center space-x-4 hover:bg-[#016E5B] hover:text-white p-2 rounded-lg transition-all duration-200"
                    onClick={handleLogoutClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleLogoutClick();
                        }
                    }}
                >
                    <IoIosLogOut className="text-xl" />
                    <div className="hidden lg:group-hover:block">Logout</div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showLogoutConfirmation}
                onClose={() => setShowLogoutConfirmation(false)}
                onConfirm={handleLogoutConfirm}
            />
        </div>
    );
};

export default SideNav;
