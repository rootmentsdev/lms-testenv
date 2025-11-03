/**
 * Authentication Redux Slice
 * 
 * Manages authentication state including user data, token, and authentication status
 * Provides actions for setting user and logging out
 */
import { createSlice } from '@reduxjs/toolkit';

/**
 * Retrieves authentication token from localStorage safely
 * 
 * @returns {string|null} - Token if exists, null otherwise
 */
const getStoredToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve token from localStorage:', error);
        return null;
    }
};

/**
 * Initial authentication state
 */
const initialState = {
    user: null,
    token: getStoredToken(),
    isAuthenticated: false,
};

/**
 * Redux Toolkit slice for authentication
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Sets the authenticated user in state
         * 
         * @param {Object} state - Current authentication state
         * @param {Object} action - Action payload containing user data
         * @param {string} action.payload.userId - User identifier
         * @param {string} action.payload.role - User role
         */
        setUser: (state, action) => {
            state.user = {
                userId: action.payload.userId,
                role: action.payload.role,
            };
            state.isAuthenticated = true;
        },
        
        /**
         * Logs out the user by clearing all authentication data
         * Also removes token from localStorage
         * 
         * @param {Object} state - Current authentication state
         */
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            
            try {
                localStorage.removeItem('token');
            } catch (error) {
                console.error('Failed to remove token from localStorage:', error);
            }
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
