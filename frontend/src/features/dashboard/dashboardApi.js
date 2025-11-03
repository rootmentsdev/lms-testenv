import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import API_CONFIG from '../../api/api';

/**
 * Cache tag types for RTK Query invalidation
 */
const CACHE_TAG_TYPES = {
    DASHBOARD_DATA: 'DashboardData',
    EMPLOYEE_COUNT: 'EmployeeCount',
    HOME_PROGRESS: 'HomeProgress',
    BEST_USERS: 'BestUsers',
    STORE_MANAGER: 'StoreManager',
    NOTIFICATIONS: 'Notifications',
    LMS_STATS: 'LMSStats',
};

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
 * Builds authentication headers for API requests
 * 
 * @returns {Object} - Headers object with Content-Type and optional Authorization
 */
const getAuthHeaders = () => {
    const token = getAuthToken();
    
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/**
 * RTK Query cache configuration
 * No caching enabled for real-time updates
 */
const CACHE_CONFIG = {
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
};

/**
 * RTK Query API slice for dashboard data
 * Handles all dashboard-related API calls with real-time updates
 */
export const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: API_CONFIG.baseUrl,
        credentials: 'include',
    }),
    tagTypes: Object.values(CACHE_TAG_TYPES),
  
  endpoints: (builder) => ({
    // Get main dashboard progress data
    getDashboardProgress: builder.query({
      query: () => ({
        url: 'api/get/progress',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.DASHBOARD_DATA],
      ...CACHE_CONFIG,
    }),

    // Get employee count
    getEmployeeCount: builder.query({
      query: () => ({
        url: 'api/employee/management/with-training-details',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.EMPLOYEE_COUNT],
      ...CACHE_CONFIG,
    }),

    // Get home progress data (for charts)
    getHomeProgress: builder.query({
      query: () => ({
        url: 'api/admin/get/HomeProgressData',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.HOME_PROGRESS],
      ...CACHE_CONFIG,
    }),

    // Get best three users
    getBestThreeUsers: builder.query({
      query: () => ({
        url: 'api/admin/get/bestThreeUser',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.BEST_USERS],
      ...CACHE_CONFIG,
    }),

    // Get store manager data
    getStoreManagerData: builder.query({
      query: () => ({
        url: 'api/admin/get/storemanagerData',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.STORE_MANAGER],
      ...CACHE_CONFIG,
    }),

    // Get store manager due data
    getStoreManagerDueData: builder.query({
      query: () => ({
        url: 'api/admin/get/storemanagerduedata',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.STORE_MANAGER],
      ...CACHE_CONFIG,
    }),

    // Get notifications
    getNotifications: builder.query({
      query: () => ({
        url: 'api/admin/home/notification',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.NOTIFICATIONS],
      ...CACHE_CONFIG,
    }),

    // Get LMS login stats
    getLMSStats: builder.query({
      query: () => ({
        url: 'api/lms-login/count-simple',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: [CACHE_TAG_TYPES.LMS_STATS],
      ...CACHE_CONFIG,
    }),
  }),
});

export const {
  useGetDashboardProgressQuery,
  useGetEmployeeCountQuery,
  useGetHomeProgressQuery,
  useGetBestThreeUsersQuery,
  useGetStoreManagerDataQuery,
  useGetStoreManagerDueDataQuery,
  useGetNotificationsQuery,
  useGetLMSStatsQuery,
  useLazyGetDashboardProgressQuery,
  useLazyGetEmployeeCountQuery,
} = dashboardApi;

