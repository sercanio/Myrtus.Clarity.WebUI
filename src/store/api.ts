import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';
import { AzureADB2CService } from '@services/azureAdB2CService';
import { setAzureAuthTokens, logout, fetchUserProfile } from '@store/slices/authSlice';
import { useMsal } from '@azure/msal-react';

const useAuthToken = () => {
  const { accounts } = useMsal();
  return accounts[0].idTokenClaims?.['access_token'];
};

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // retrieve token from MSAL and set it in the headers
    const token = useAuthToken();
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
        const tokens = await AzureADB2CService.refreshToken(refreshToken);
        
        api.dispatch(setAzureAuthTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
        }));

        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('id_token', tokens.id_token);

        api.dispatch(fetchUserProfile());

        result = await baseQuery(args, api, extraOptions);
      } catch (error) {
        api.dispatch(logout());
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
      }
    } else {
      api.dispatch(logout());
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users', 'AuditLogs'],
  endpoints: () => ({}),
});