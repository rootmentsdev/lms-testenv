/**
 * Login Page Component
 * 
 * Handles user authentication with email and password
 * Displays login form and handles authentication state
 * 
 * @returns {JSX.Element} - Login page component
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { FaEye, FaEyeSlash } from "react-icons/fa";

import API_CONFIG from '../../api/api';
import { setUser } from '../../features/auth/authSlice';

/**
 * API endpoint for login
 */
const LOGIN_ENDPOINT = 'api/admin/admin/login';

/**
 * Route path constants
 */
const ROUTE_PATHS = {
    HOME: '/',
};

/**
 * Stores authentication token in localStorage safely
 * 
 * @param {string} token - Authentication token
 */
const storeAuthToken = (token) => {
    try {
        localStorage.setItem('token', token);
    } catch (error) {
        console.error('Failed to store auth token:', error);
        throw new Error('Failed to store authentication token');
    }
};

/**
 * Login Page Component
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /**
     * Handles email input change
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
     */
    const handleEmailChange = useCallback((event) => {
        setEmail(event.target.value);
    }, []);

    /**
     * Handles password input change
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
     */
    const handlePasswordChange = useCallback((event) => {
        setPassword(event.target.value);
    }, []);

    /**
     * Toggles password visibility
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    /**
     * Handles form submission
     * 
     * @param {React.FormEvent} event - Form submit event
     */
    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const url = `${API_CONFIG.baseUrl}${LOGIN_ENDPOINT}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, EmpId: password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store token
                storeAuthToken(data.token);

                // Dispatch user info to Redux store
                if (data.user?.userId && data.user?.role) {
                    dispatch(setUser({
                        userId: data.user.userId,
                        role: data.user.role,
                    }));
                }

                // Display success message and redirect
                toast.success('Login successful');
                navigate(ROUTE_PATHS.HOME);
            } else {
                // Handle login failure
                const errorMessage = data.message || 'Unknown error';
                toast.error(`Login failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [email, password, dispatch, navigate]);

    return (
        <div className="flex h-screen">
            {/* Left Side - Form */}
            <div className="md:w-1/2 w-full flex justify-center items-center bg-gray-100 flex-col">
                <p className="text-2xl mb-10 md:w-[400px] text-black font-semibold">
                    Empowering Employee <span className="text-[#016E5B]">Training</span> and Growth
                </p>
                
                <form
                    onSubmit={handleSubmit}
                    className="p-8 bg-white shadow-lg border-gray-500 rounded-lg w-full md:mx-0 mx-2 md:w-[400px] md:h-[400px]"
                >
                    <h2 className="text-2xl font-semibold text-center mb-6 text-[#016E5B]">
                        Login
                    </h2>

                    {/* Email Field */}
                    <label className="input input-bordered flex items-center border-gray-300 gap-2 mb-4 bg-white">
                        <input
                            type="email"
                            className="grow text-[#016E5B] font-semibold"
                            placeholder="Email Address"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            disabled={isLoading}
                            aria-label="Email address"
                        />
                    </label>

                    {/* Password Field */}
                    <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-300 bg-white relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="grow text-[#016E5B] font-semibold pr-10"
                            placeholder="Admin Password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            disabled={isLoading}
                            aria-label="Password"
                        />
                        <div 
                            className="absolute text-[#016E5B] text-2xl right-5 cursor-pointer"
                            onClick={togglePasswordVisibility}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    togglePasswordVisibility();
                                }
                            }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </label>

                    {/* Submit Button */}
                    <div className="flex justify-center items-center">
                        {isLoading ? (
                            <button
                                type="button"
                                className="w-[50%] bg-[#016E5B] text-white text-center py-2 rounded-lg mt-[50px] cursor-not-allowed opacity-75"
                                disabled
                            >
                                Loading...
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="w-[50%] bg-[#016E5B] text-white py-2 rounded-lg hover:bg-[#014f42] mt-[50px] transition-colors"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Right Side - Background Image */}
            <div className="w-1/2 bg-[#016E5B] md:flex justify-center items-center hidden">
                <img 
                    src="./image.png" 
                    width="500px" 
                    alt="Learning Management System" 
                />
            </div>
        </div>
    );
};

export default Login;
