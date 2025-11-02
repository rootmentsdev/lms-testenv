// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';

// Create persisted reducer for auth
const persistedAuthReducer = persistReducer(
    { key: 'auth', storage, whitelist: ['user'] },
    authReducer
);

// Create persisted reducer for dashboard API - persist queries cache
const persistedDashboardReducer = persistReducer(
    { key: dashboardApi.reducerPath, storage },
    dashboardApi.reducer
);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [dashboardApi.reducerPath]: persistedDashboardReducer,
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
