import { api } from '@store/api';
import type { Role } from '@/types/role';
import type { PaginatedResponse } from '@/types/paginatedResponse';

export const permissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<Role>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: '/roles',
        params: {
          pageIndex,
          pageSize
        },
      }),
    }),
    updateUserRole: builder.mutation<void, {
      userId: string;
      roleId: string;
      operation: 'Add' | 'Remove';
    }>({
      query: ({ userId, roleId, operation }) => ({
        url: `/users/${userId}/roles`,
        method: 'POST',
        body: {
          operation,
          roleId,
        },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useGetRolesQuery, useUpdateUserRoleMutation } = permissionApi; 