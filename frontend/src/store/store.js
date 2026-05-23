// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';

// Only persist auth (user session) — never cache API responses
const persistedAuthReducer = persistReducer(
    { key: 'auth', storage, whitelist: ['user'] },
    authReducer
);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        // dashboardApi uses its own in-memory cache only (not persisted to localStorage)
        [dashboardApi.reducerPath]: dashboardApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(dashboardApi.middleware),
});

export const persistor = persistStore(store);

export default store;
