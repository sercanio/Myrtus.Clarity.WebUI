import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/dist/query/react';
import { KeycloakService } from '../services/keycloak';
import { setAuthTokens, logout } from './slices/authSlice';
import { RootState } from './index';

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
    // Try to get a new token
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        const tokens = await KeycloakService.refreshToken(refreshToken);
        
        // Store the new tokens
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        // Update the redux store
        api.dispatch(setAuthTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }));

        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } catch (error) {
        // If refresh fails, log out the user
        api.dispatch(logout());
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } else {
      // No refresh token available, log out the user
      api.dispatch(logout());
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users'],
  endpoints: () => ({}),
}); 