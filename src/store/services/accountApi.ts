import { api } from '@store/api';
import type { RegisterUser } from '@types/registerUser';
import { UserInfo } from '@types/user';


export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserInfo, void>({
      query: () => '/accounts/me',
      providesTags: ['Users'],
    }),
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

export const { 
  useGetCurrentUserQuery, 
  useRegisterMutation, 
  useUpdateNotificationPreferencesMutation 
} = accountApi;