import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo } from '@/types/user';
import type { NotificationPreference } from '@/types/notification';

export type ExtendedAccountInfo = UserInfo;

interface AuthState {
  isAuthenticated: boolean;
  user: ExtendedAccountInfo | null;
  accessToken: string;
  error: string | null;
}

const initialState: AuthState = { 
  isAuthenticated: false,
  user: null,
  accessToken: '',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ account: ExtendedAccountInfo | null; accessToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.account;
      state.accessToken = action.payload.accessToken;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = '';
      state.error = null;
    },
    logoutFailure: (state) => {
      state.error = 'Failed to logout';
    },
  },
});

export const { loginSuccess, loginFailure, logoutSuccess, logoutFailure } = authSlice.actions;
export default authSlice.reducer;
