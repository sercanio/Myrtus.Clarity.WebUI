import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAccount } from '@azure/msal-browser';

interface TenantProfile {
  // Define the structure of your tenant profile here
  // Example:
  // profileName: string;
  // permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: Omit<UserAccount, 'tenantProfiles'> & { tenantProfiles: Record<string, TenantProfile> } | null; // Updated
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ account: AuthState['user']; accessToken: string }>) => { // Updated
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.account;
      state.accessToken = action.payload.accessToken;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null; 
      state.error = null;
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
  loginRequest, 
  loginSuccess, 
  loginFailure, 
  logout,
  logoutFailure,
} = authSlice.actions;
export default authSlice.reducer;