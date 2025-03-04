import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include',
  prepareHeaders: async (headers) => {
    const xsrfToken = localStorage.getItem('xsrfToken');
    if (xsrfToken) {
      headers.set('X-XSRF-TOKEN', xsrfToken);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    console.error('API Error:', {
      status: result.error.status,
      data: result.error.data,
      url: typeof args === 'string' ? args : args.url,
    });
  }

  if (result.error && result.error.status === 401) {
    // Optionally, trigger a reauthentication flow
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users', 'AuditLogs', 'Notifications', 'Roles', 'Permissions', 'Contents', 'Media', 'SEO'],
  endpoints: () => ({}),
});
