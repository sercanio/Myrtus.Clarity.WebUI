import { createSlice } from '@reduxjs/toolkit';
import { Notification } from '@types/notification';
import { notification } from 'antd';

interface UiState {
  isLoading: boolean;
  isDarkMode: boolean;
  notificationCount: number;
  notifications: Notification[];
}

const initialState: UiState = {
  isLoading: false,
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
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setNotificationCount: (state, action: { payload: number }) => {
      state.notificationCount = action.payload;
    },
    setNotifications: (state, action: { payload: Notification[] }) => {
      state.notifications = action.payload.map(notification => ({
        ...notification,
        isRead: true,
      }));
    },
    addNotification: (state, action: { payload: Notification }) => {
      state.notifications.unshift({
        ...action.payload,
        isRead: false,
      });
      state.notificationCount += 1;
    },
    resetNotificationCount: (state) => {
      state.notificationCount = 0;
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    },
  },
});

export const { 
  setLoading, 
  toggleDarkMode, 
  setNotificationCount, 
  setNotifications, 
  addNotification, 
  resetNotificationCount,
} = uiSlice.actions;
export default uiSlice.reducer;