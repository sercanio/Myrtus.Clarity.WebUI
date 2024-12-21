import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountInfo } from '@azure/msal-browser';
import { UserInfo } from '@types/user';
import { NotificationPreference } from '@types/notification';

interface ExtendedAccountInfo extends Omit<AccountInfo, 'tenantProfiles'> {
  tenantProfiles: Record<string, UserInfo>;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles?: Array<{ name: string }>;
  notificationPreferences?: NotificationPreference
}

interface AuthState {
  isAuthenticated: boolean;
  user: ExtendedAccountInfo | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: AuthState = { 
  isAuthenticated: false,
  user: null,
  accessToken: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ account: AuthState['user']; accessToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.account;
      state.accessToken = action.payload.accessToken;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    logoutFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.error = 'Failed to retrieve user account.';
    },
  },
});

export const { 
  loginSuccess, 
  loginFailure, 
  logoutFailure,
} = authSlice.actions;
export default authSlice.reducer;