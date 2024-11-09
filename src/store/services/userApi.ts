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
      transformResponse: (response: PaginatedResponse<User>) => response,
    }),
  }),
});

export const { useGetUsersQuery } = userApi; 