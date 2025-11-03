/**
 * Redux Store Configuration
 * 
 * Centralized state management configuration using Redux Toolkit
 * Includes authentication persistence and RTK Query API integration
 */
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';

/**
 * Redux Persist configuration for authentication
 * Persists only the user data to localStorage
 */
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user'],
};

/**
 * Creates persisted reducer for authentication state
 * This ensures user session persists across page refreshes
 */
const persistedAuthReducer = persistReducer(
    authPersistConfig,
    authReducer
);

/**
 * Actions that should be ignored during serialization check
 * Required for Redux Persist to work correctly
 */
const SERIALIZABLE_IGNORED_ACTIONS = [
    'persist/PERSIST',
    'persist/REHYDRATE',
];

/**
 * Configures Redux store with all reducers and middleware
 * 
 * @returns {Object} Configured Redux store
 */
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: SERIALIZABLE_IGNORED_ACTIONS,
            },
        }).concat(dashboardApi.middleware),
});

/**
 * Redux Persist persistor instance
 * Used to persist and rehydrate store state
 */
export const persistor = persistStore(store);

export default store;
