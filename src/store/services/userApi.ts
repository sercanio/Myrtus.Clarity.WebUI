import { api } from '@store/api';
import type { UserInfo } from '@/types/user';
import type { PaginatedResponse } from '@/types/paginatedResponse';
import type { DynamicQuery } from '@/types/dynamicQuery';
import type { NotificationResponse } from '@/types/notification';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<UserInfo>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: 'users',
        params: {
          pageIndex,
          pageSize
        },
      }),
      providesTags: ['Users'],
    }),
    getUserDetails: builder.query<UserInfo, string>({
      query: (userId) => `users/${userId}`,
      providesTags: ['Users'],
    }),
    updateUserRole: builder.mutation<void, {
      userId: string;
      roleId: string;
      operation: 'Add' | 'Remove';
    }>({
      query: ({ userId, roleId, operation }) => ({
        url: `users/${userId}/roles`,
        method: 'PATCH',
        body: {
          operation,
          roleId,
        },
      }),
      invalidatesTags: ['Users'],
    }),
    getUsersDynamic: builder.query<PaginatedResponse<UserInfo>, DynamicQuery>({
      query: ({ pageIndex, pageSize, sort, filter }) => ({
        url: `users/dynamic`,
        method: 'POST',
        params: {
          pageIndex,
          pageSize,
        },
        body: {
          sort,
          filter,
        },
      }),
      providesTags: ['Users'],
    }),
    getUsersByRole: builder.query<PaginatedResponse<UserInfo>, { 
      roleId: string; 
      pageIndex: number; 
      pageSize: number;
    }>({
      query: ({ roleId, pageIndex, pageSize }) => ({
        url: `users/roles/${roleId}`,
        params: {
          pageIndex,
          pageSize,
        },
      }),
      providesTags: ['Users'],
    }),
    getNotifications: builder.query<NotificationResponse, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: 'notifications',
        params: {
          pageIndex,
          pageSize
        },
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: 'notifications/read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: true,
}).enhanceEndpoints({
  addTagTypes: ['Users', 'AuditLogs', 'Notifications'],
});

export const { 
  useGetUsersQuery, 
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useGetUsersDynamicQuery,
  useGetUsersByRoleQuery,
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation
} = userApi;