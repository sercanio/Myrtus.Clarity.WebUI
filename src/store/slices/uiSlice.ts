import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  isDarkMode: boolean;
}

const initialState: UiState = {
  isLoading: false,
  isDarkMode: false,
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
  },
});

export const { setLoading, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer; 