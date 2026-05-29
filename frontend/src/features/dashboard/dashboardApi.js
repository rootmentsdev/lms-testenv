import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import baseUrl from '../../api/api';
import { last7Days } from './dashboardUtils';

const CACHE_TTL = 300; // 5 minutes — dashboard data does not need constant refetch

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl.baseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['HomeProgress', 'Walkins', 'BestUsers', 'StoreManager', 'Notifications', 'LMSStats', 'Tasks'],

  endpoints: (builder) => ({
    // Single source of truth for dashboard stats + charts (per-branch progress)
    getHomeProgress: builder.query({
      query: () => 'api/admin/get/HomeProgressData',
      providesTags: ['HomeProgress'],
      keepUnusedDataFor: CACHE_TTL,
    }),

    getDashboardTasks: builder.query({
      query: () => 'api/task/list',
      providesTags: ['Tasks'],
      keepUnusedDataFor: CACHE_TTL,
    }),

    // Weekly walk-ins for chart + overview card (shared cache)
    getWeeklyWalkins: builder.query({
      query: () => {
        const days = last7Days();
        const start = days[0].toISOString().split('T')[0];
        const end = days[days.length - 1].toISOString().split('T')[0];
        return `api/walkin/list?startDate=${start}&endDate=${end}`;
      },
      providesTags: ['Walkins'],
      keepUnusedDataFor: CACHE_TTL,
    }),

    getBestThreeUsers: builder.query({
      query: () => 'api/admin/get/bestThreeUser',
      providesTags: ['BestUsers'],
      keepUnusedDataFor: 3600,
    }),

    getStoreManagerData: builder.query({
      query: () => 'api/admin/get/storemanagerData',
      providesTags: ['StoreManager'],
      keepUnusedDataFor: 3600,
    }),

    getStoreManagerDueData: builder.query({
      query: () => 'api/admin/get/storemanagerduedata',
      providesTags: ['StoreManager'],
      keepUnusedDataFor: 3600,
    }),

    getNotifications: builder.query({
      query: () => 'api/admin/home/notification',
      providesTags: ['Notifications'],
      keepUnusedDataFor: 3600,
    }),

    getLMSStats: builder.query({
      query: () => 'api/lms-login/count-simple',
      providesTags: ['LMSStats'],
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const {
  useGetHomeProgressQuery,
  useGetWeeklyWalkinsQuery,
  useGetBestThreeUsersQuery,
  useGetStoreManagerDataQuery,
  useGetStoreManagerDueDataQuery,
  useGetNotificationsQuery,
  useGetLMSStatsQuery,
  useGetDashboardTasksQuery,
} = dashboardApi;
