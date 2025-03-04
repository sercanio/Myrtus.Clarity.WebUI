// src/store/services/accountApi.ts
import { api } from '@store/api';
import type { RegisterUser } from '@/types/registerUser';
import { UserInfo } from '@/types/user';
import type { LoginRequest } from '@/types/loginRequest';

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserInfo, void>({
      query: () => '/Account/me',
      providesTags: ['Users'],
    }),
    login: builder.mutation<void, LoginRequest>({
      query: (credentials) => ({
        url: '/Account/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<void, RegisterUser>({
      query: (user) => ({
        url: '/Account/register',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Users'],
    }),
    updateNotificationPreferences: builder.mutation<
      void,
      { inAppNotification: boolean; emailNotification: boolean; pushNotification: boolean }
    >({
      query: (preferences) => ({
        url: '/Account/me/notifications',
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['Users'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/Account/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useRegisterMutation,
  useUpdateNotificationPreferencesMutation,
  useLogoutMutation,
  useLazyGetCurrentUserQuery,
} = accountApi;
