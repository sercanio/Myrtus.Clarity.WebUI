import { api } from '../api';
import type { PaginatedResponse } from '../../types/paginatedResponse';
import type { AuditLog } from '../../types/auditLog';
import type { DynamicQuery } from '../../types/dynamicQuery';

export const auditLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useGetAuditLogsDynamicQuery } = auditLogApi;
