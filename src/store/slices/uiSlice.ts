import { createSlice } from '@reduxjs/toolkit';
import { Notification } from '@/types/notification';

interface UiState {
  isLoading: boolean;
  isUserLoading: boolean;
  isDarkMode: boolean;
  notificationCount: number;
  notifications: Notification[];
}

const initialState: UiState = {
  isLoading: false,
  isUserLoading: false,
  isDarkMode: false,
  notificationCount: 0,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: { payload: boolean }) => {
      state.isLoading = action.payload;
    },
    setUserLoading: (state, action: { payload: boolean }) => {
      state.isUserLoading = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setNotificationCount: (state, action: { payload: number }) => {
      state.notificationCount = action.payload;
    },
    setNotifications: (state, action: { payload: Notification[] }) => {
      state.notifications = action.payload;
      state.notificationCount = state.notifications.filter(n => !n.isRead).length;
    },
    addNotification: (state, action: { payload: Notification }) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.notificationCount += 1;
      }
    },
    resetNotificationCount: (state) => {
      state.notificationCount = 0;
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    }
  },
});

export const {
  setLoading,
  setUserLoading,
  toggleDarkMode,
  setNotificationCount,
  setNotifications,
  addNotification,
  resetNotificationCount,
} = uiSlice.actions;

export default uiSlice.reducer;