import { api } from '@store/api';
import type { PaginatedResponse } from '@types/paginatedResponse';
import type { AuditLog } from '@types/auditLog';
import type { DynamicQuery } from '@types/dynamicQuery';

export const auditLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, { pageIndex: number; pageSize: number }>({
      query: ({ pageIndex, pageSize }) => ({
        url: 'auditlogs',
        params: { pageIndex, pageSize }
      }),
      providesTags: ['AuditLogs']
    }),
    getAuditLogsDynamic: builder.query<PaginatedResponse<AuditLog>, DynamicQuery>({
      query: (params) => ({
        url: 'auditlogs/dynamic',
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
      providesTags: ['AuditLogs'],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetAuditLogsDynamicQuery } = auditLogApi;
