import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';
import { KeycloakService } from '../services/keycloak';
import { setAuthTokens, logout, fetchUserProfile } from './slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        const tokens = await KeycloakService.refreshToken(refreshToken);
        
        api.dispatch(setAuthTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }));

        api.dispatch(fetchUserProfile());

        result = await baseQuery(args, api, extraOptions);
      } catch (error) {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users'],
  endpoints: () => ({}),
}); 