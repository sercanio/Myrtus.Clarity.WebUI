import { api } from '../api';
import type { Role, Permission, PaginatedResponse } from '../../types/permission';

export const roleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<PaginatedResponse<Role>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: '/roles',
        params: { pageIndex, pageSize }
      }),
      providesTags: ['Roles']
    }),
    
    getRoleDetails: builder.query<Role, string>({
      query: (roleId) => `/roles/${roleId}`,
      providesTags: ['Roles']
    }),
    
    getPermissions: builder.query<PaginatedResponse<Permission>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: '/permissions',
        params: { pageIndex, pageSize }
      }),
      providesTags: ['Permissions']
    }),
    
    updateRolePermission: builder.mutation<void, {
      roleId: string;
      permissionId: string;
      operation: 'Add' | 'Remove';
    }>({
      query: ({ roleId, permissionId, operation }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'PATCH',
        body: {
          permissionId,
          operation,
        },
      }),
      invalidatesTags: ['Roles'],
    }),
    
    createRole: builder.mutation<Role, { name: string }>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles']
    }),
    
    deleteRole: builder.mutation<void, string>({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles']
    }),
    
    updateRoleName: builder.mutation<void, {
      roleId: string;
      name: string;
    }>({
      query: ({ roleId, name }) => ({
        url: `/roles/${roleId}/name`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleDetailsQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleNameMutation,
} = roleApi; 