import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';
import type { RootState } from '@store/index';
import { logoutUser } from '@services/msalService';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;        
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('No access token available for API request');
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    console.error('API Error:', {
      status: result.error.status,
      data: result.error.data,
      url: args.toString(),
    });
  }

  if (result.error && result.error.status === 401) {
    api.dispatch(logoutUser());
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users', 'AuditLogs', 'Notifications', 'Roles', 'Permissions', 'Contents', 'Media', 'SEO'],
  endpoints: () => ({}),
});