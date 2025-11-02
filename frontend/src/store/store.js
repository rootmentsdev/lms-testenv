// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import { dashboardApi } from '../features/dashboard/dashboardApi.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(dashboardApi.middleware),
});

export default store;
