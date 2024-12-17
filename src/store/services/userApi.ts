import { api } from '@store/api';
import type { User } from '@types/user';
import type { PaginatedResponse } from '@types/PaginatedResponse';
import type { DynamicQuery } from '@types/dynamicQuery';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: 'users',
        params: {
          pageIndex,
          pageSize
        },
      }),
      providesTags: ['Users'],
    }),
    getUserDetails: builder.query<User, string>({
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
    getUsersDynamic: builder.query<PaginatedResponse<User>, DynamicQuery>({
      query: (params) => ({
        url: 'users/dynamic',
        method: 'POST',
        params: {
          pageIndex: params.pageIndex,
          pageSize: params.pageSize
        },
        body: {
          sort: params.sort,
          filter: params.filter
        }
      }),
      providesTags: ['Users'],
    }),
    getUsersByRole: builder.query<PaginatedResponse<User>, { 
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
  }),
});

export const { 
  useGetUsersQuery, 
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useGetUsersDynamicQuery,
  useGetUsersByRoleQuery
} = userApi; 