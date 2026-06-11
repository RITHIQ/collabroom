import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Theme } from '../../types';

interface ThemeState {
  theme: Theme;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('colabroom-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: ThemeState = {
  theme: 'light', // will be set on hydration
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem('colabroom-theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme(state) {
      const next = state.theme === 'light' ? 'dark' : 'light';
      state.theme = next;
      localStorage.setItem('colabroom-theme', next);
      document.documentElement.setAttribute('data-theme', next);
    },
    initTheme(state) {
      const theme = getInitialTheme();
      state.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    },
  },
});

export const { setTheme, toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
