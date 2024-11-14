import { api } from '../api';
import type { User, PaginatedResponse } from '../../types/user';

interface SortDescriptor {
  field: string;
  dir: string;
}

interface FilterDescriptor {
  field?: string;
  operator?: string;
  value?: string;
  logic?: string;
  filters?: FilterDescriptor[];
  isCaseSensitive?: boolean;
}

interface DynamicQuery {
  sort?: SortDescriptor[];
  filter?: FilterDescriptor;
  pageIndex: number;
  pageSize: number;
}

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
      providesTags: ['User'],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useGetUsersDynamicQuery
} = userApi; 