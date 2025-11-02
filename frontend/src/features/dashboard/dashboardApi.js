import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from '../../api/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: baseUrl.baseUrl,
    credentials: 'include',
  }),
  tagTypes: ['DashboardData', 'EmployeeCount', 'HomeProgress', 'BestUsers', 'StoreManager', 'Notifications', 'LMSStats'],
  
  endpoints: (builder) => ({
    // Get main dashboard progress data
    getDashboardProgress: builder.query({
      query: () => ({
        url: 'api/get/progress',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['DashboardData'],
      // Extended cache for Render - 1 hour for localStorage persistence
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false, // Use cached data to speed up Render loading
      refetchOnFocus: false,
      refetchOnReconnect: false, // Don't refetch on reconnect to use cache
    }),

    // Get employee count
    getEmployeeCount: builder.query({
      query: () => ({
        url: 'api/employee/management/with-training-details',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['EmployeeCount'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get home progress data (for charts)
    getHomeProgress: builder.query({
      query: () => ({
        url: 'api/admin/get/HomeProgressData',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['HomeProgress'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get best three users
    getBestThreeUsers: builder.query({
      query: () => ({
        url: 'api/admin/get/bestThreeUser',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['BestUsers'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get store manager data
    getStoreManagerData: builder.query({
      query: () => ({
        url: 'api/admin/get/storemanagerData',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['StoreManager'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get store manager due data
    getStoreManagerDueData: builder.query({
      query: () => ({
        url: 'api/admin/get/storemanagerduedata',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['StoreManager'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get notifications
    getNotifications: builder.query({
      query: () => ({
        url: 'api/admin/home/notification',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['Notifications'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }),

    // Get LMS login stats
    getLMSStats: builder.query({
      query: () => ({
        url: 'api/lms-login/count-simple',
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      providesTags: ['LMSStats'],
      keepUnusedDataFor: 3600,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
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

