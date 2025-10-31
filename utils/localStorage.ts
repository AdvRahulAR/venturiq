
import { Analysis } from '../types';
import { LOCAL_STORAGE_KEYS, MAX_HISTORY_ENTRIES } from '../constants';

export const getStoredHistory = (): Analysis[] => {
  const historyJson = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY);
  return historyJson ? JSON.parse(historyJson) : [];
};

export const setStoredHistory = (history: Analysis[]): void => {
  const limitedHistory = history.slice(-MAX_HISTORY_ENTRIES);
  localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
};

export const getStoredTheme = (): 'dark' | 'light' => {
  const theme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
  return theme === 'dark' ? 'dark' : 'light';
};

export const setStoredTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
};