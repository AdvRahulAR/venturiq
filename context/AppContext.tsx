
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Analysis } from '../types';
import {
  getStoredHistory,
  setStoredHistory,
  getStoredTheme,
  setStoredTheme,
} from '../utils/localStorage';
import { MAX_HISTORY_ENTRIES } from '../constants';

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
  history: Analysis[];
  addAnalysisToHistory: (analysis: Analysis) => void;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
  currentAnalysis: Analysis | null;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  toast: Toast | null;
  setToast: (toast: Toast | null) => void;
}

export const AppContext = createContext<AppContextType>({
  history: [],
  addAnalysisToHistory: () => {},
  deleteAnalysis: () => {},
  clearHistory: () => {},
  currentAnalysis: null,
  setCurrentAnalysis: () => {},
  theme: 'light',
  toggleTheme: () => {},
  isLoading: false,
  setIsLoading: () => {},
  toast: null,
  setToast: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistoryState] = useState<Analysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToastState] = useState<Toast | null>(null);

  useEffect(() => {
    setHistoryState(getStoredHistory());
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  useEffect(() => {
      if (toast) {
          const timer = setTimeout(() => setToastState(null), 5000);
          return () => clearTimeout(timer);
      }
  }, [toast]);

  const addAnalysisToHistory = (analysis: Analysis) => {
    setHistoryState(prevHistory => {
      const newHistory = [analysis, ...prevHistory];
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES);
      setStoredHistory(limitedHistory);
      return limitedHistory;
    });
  };

  const deleteAnalysis = (id: string) => {
    setHistoryState(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      setStoredHistory(newHistory);
      return newHistory;
    });
  };

  const clearHistory = () => {
    setStoredHistory([]);
    setHistoryState([]);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setStoredTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <AppContext.Provider
      value={{
        history,
        addAnalysisToHistory,
        deleteAnalysis,
        clearHistory,
        currentAnalysis,
        setCurrentAnalysis,
        theme,
        toggleTheme,
        isLoading,
        setIsLoading,
        toast,
        setToast: (t) => setToastState(t),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};