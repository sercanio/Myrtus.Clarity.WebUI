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
  }),
});

export const { useRegisterMutation } = accountApi;