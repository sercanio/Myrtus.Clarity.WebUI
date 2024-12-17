import { api } from '@store/api';
import type { RegisterUser } from '@types/registerUser';

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<void, RegisterUser>({
      query: (user) => ({
        url: '/accounts/register',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Users'],
    }),
    updateNotificationPreferences: builder.mutation<void, {
      inAppNotification: boolean;
      emailNotification: boolean;
      pushNotification: boolean;
    }>({
      query: (preferences) => ({
        url: '/accounts/me/notifications',
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useRegisterMutation, useUpdateNotificationPreferencesMutation } = accountApi;