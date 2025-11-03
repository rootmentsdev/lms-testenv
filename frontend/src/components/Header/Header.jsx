/**
 * Header Component
 * 
 * Main application header with search functionality, notifications, and user menu
 * Includes logo, search bar, notifications, and profile dropdown
 * 
 * @returns {JSX.Element} - Header component
 */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoIosSearch } from "react-icons/io";
import { GoBell } from "react-icons/go";
import { IoPersonCircleSharp } from "react-icons/io5";

import API_CONFIG from "../../api/api";
import LogoutConfirmation from "../LogoutConfirmation/LogoutConfirmation";
import { logout } from "../../features/auth/authSlice";

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    HOME: '/',
    NOTIFICATIONS: '/admin/Notification',
    PROFILE: '/admin/profile',
    SETTINGS: '/settings',
    LOGIN: '/login',
    EMPLOYEE_DETAIL: '/detailed',
    BRANCH_DETAIL: '/branch/detailed',
};

/**
 * Search API endpoint
 */
const SEARCH_ENDPOINT = 'api/admin/get/searching/userORbranch';

/**
 * Search debounce delay in milliseconds
 */
const SEARCH_DEBOUNCE_DELAY = 500;

/**
 * User role constant for super admin
 */
const SUPER_ADMIN_ROLE = 'super_admin';

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
 * Performs search API call for users and branches
 * 
 * @param {string} searchQuery - Search query string
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Search results with users and branches
 * @throws {Error} - If search fails
 */
const performSearch = async (searchQuery, token) => {
    const url = `${API_CONFIG.baseUrl}${SEARCH_ENDPOINT}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ search: searchQuery }),
    });

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
};

/**
 * Header Component
 */
const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    // State management
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchUsers, setSearchUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    /**
     * Checks if a route path is currently active
     * 
     * @param {string} path - Route path to check
     * @returns {boolean} - True if path is active
     */
    const isActive = useCallback((path) => {
        return location.pathname === path;
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
        try {
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Failed to remove token:', error);
        }
        
        dispatch(logout());
        navigate(ROUTE_PATHS.LOGIN);
    }, [dispatch, navigate]);

    /**
     * Handles search input change
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
     */
    const handleSearchChange = useCallback((event) => {
        setSearch(event.target.value);
    }, []);

    /**
     * Performs search operation
     */
    const executeSearch = useCallback(async () => {
        const trimmedSearch = search.trim();
        
        if (!trimmedSearch) {
            setIsSearching(false);
            setSearchResults([]);
            setSearchUsers([]);
            return;
        }

        const token = getAuthToken();
        if (!token) {
            console.error('No authentication token available for search');
            return;
        }

        setIsSearching(true);

        try {
            const result = await performSearch(trimmedSearch, token);
            setSearchResults(result.branch || []);
            setSearchUsers(result.data || []);
        } catch (error) {
            console.error('Search API error:', error.message);
            setSearchResults([]);
            setSearchUsers([]);
        } finally {
            setIsSearching(false);
        }
    }, [search]);

    // Debounced search effect
    useEffect(() => {
        const trimmedSearch = search.trim();
        
        if (!trimmedSearch) {
            setIsSearching(false);
            setSearchResults([]);
            setSearchUsers([]);
            return;
        }

        const delaySearch = setTimeout(() => {
            executeSearch();
        }, SEARCH_DEBOUNCE_DELAY);

        return () => clearTimeout(delaySearch);
    }, [search, executeSearch]);

    /**
     * Renders search results dropdown
     */
    const renderSearchResults = () => {
        if (!isSearching) {
            return null;
        }

        const hasUsers = searchUsers.length > 0;
        const hasBranches = searchResults.length > 0;
        const hasResults = hasUsers || hasBranches;

        return (
            <div className="absolute top-full text-black left-0 w-full bg-white border shadow-md rounded-md mt-1 p-2 max-h-40 overflow-y-auto">
                {/* User Results */}
                <h2 className="text-[#016E5B] font-semibold mb-2">USER</h2>
                {hasUsers ? (
                    <div>
                        {searchUsers.map((item) => (
                            <Link 
                                to={`${ROUTE_PATHS.EMPLOYEE_DETAIL}/${item.empID}`} 
                                key={item.empID}
                                onClick={() => setSearch('')}
                            >
                                <div className="p-2 hover:bg-gray-100 cursor-pointer rounded">
                                    {item.username}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-2 text-gray-500">No results found</div>
                )}

                {/* Branch Results */}
                <h2 className="text-[#016E5B] font-semibold mb-2 mt-4">BRANCH</h2>
                {hasBranches ? (
                    <div>
                        {searchResults.map((item) => (
                            <Link 
                                to={`${ROUTE_PATHS.BRANCH_DETAIL}/${item.locCode}`} 
                                key={item.locCode}
                                onClick={() => setSearch('')}
                            >
                                <div className="p-2 hover:bg-gray-100 cursor-pointer rounded">
                                    {item.workingBranch}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-2 text-gray-500">No results found</div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="flex justify-between border-[#C8C8C8] bg-white fixed top-0 w-full z-10 border-b pb-6">
                {/* Logo Section */}
                <div className="flex mt-6 lg:justify-evenly items-center ml-5 gap-2">
                    <img 
                        src="/Rootments.jpg" 
                        alt="Rootments Logo" 
                        className="rounded-full" 
                    />
                    <Link to={ROUTE_PATHS.HOME}>
                        <div className="lg:block hidden md:block cursor-pointer">
                            <div className="text-2xl text-green-700 font-bold">ROOTMENTS</div>
                            <div className="flex justify-end text-sm">ENTERPRISE</div>
                        </div>
                    </Link>
                </div>

                {/* Right Section: Search, Notifications, Profile */}
                <div className="flex lg:gap-10 gap-3 items-center mt-4 relative">
                    {/* Search Bar */}
                    <div className="form-control relative lg:w-full hidden md:block">
                        <IoIosSearch className="absolute left-3 text-2xl top-1/2 transform -translate-y-1/2 text-black" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name, id or branch"
                            className="border-[#C8C8C8] border p-2 bg-white lg:w-[400px] w-[250px] pl-10 rounded-lg"
                            aria-label="Search users and branches"
                        />
                        {renderSearchResults()}
                    </div>

                    {/* Notifications Icon */}
                    <Link to={ROUTE_PATHS.NOTIFICATIONS}>
                        <div 
                            className={`text-2xl text-[#016E5B] ${
                                isActive(ROUTE_PATHS.NOTIFICATIONS) 
                                    ? 'bg-[#016E5B] p-2 rounded-lg text-white' 
                                    : ''
                            }`}
                            aria-label="Notifications"
                        >
                            <GoBell />
                        </div>
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="dropdown dropdown-end mr-9">
                        <IoPersonCircleSharp 
                            tabIndex={0} 
                            role="button" 
                            className={`btn btn-ghost btn-circle avatar text-[#016E5B] ${
                                isActive(ROUTE_PATHS.PROFILE) 
                                    ? 'border-[#016E5B] rounded-lg text-6xl' 
                                    : ''
                            }`}
                            aria-label="User menu"
                        />
                        <ul 
                            tabIndex={0} 
                            className="menu menu-sm dropdown-content rounded-box mt-3 w-52 p-2 shadow z-10 text-[#016E5B] bg-white"
                        >
                            <li>
                                <Link to={ROUTE_PATHS.PROFILE}>Profile</Link>
                            </li>
                            {user?.role === SUPER_ADMIN_ROLE && (
                                <li>
                                    <Link to={ROUTE_PATHS.SETTINGS}>Settings</Link>
                                </li>
                            )}
                            <li>
                                <a onClick={handleLogoutClick} className="cursor-pointer">
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>
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

export default Header;
