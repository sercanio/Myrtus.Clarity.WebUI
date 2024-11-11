import { api } from '../api';
import type { RegisterUser } from '../../types/registerUser';

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<void, RegisterUser>({
      query: (user) => ({
        url: '/accounts/register',
        method: 'POST',
        body: user,
      }),
    }),
  }),
});

export const { useRegisterMutation } = accountApi; 