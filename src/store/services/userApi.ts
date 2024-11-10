import { api } from '../api';
import type { User, PaginatedResponse } from '../../types/user';

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
      providesTags: ['User'],
    }),
    getUserDetails: builder.query<User, string>({
      query: (userId) => `users/${userId}`,
      providesTags: ['User'],
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
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation 
} = userApi; 