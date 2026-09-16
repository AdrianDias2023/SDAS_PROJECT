import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@sdas_operator_theme';

export const darkColors = {
  theme: 'dark',
  bgPrimary: '#070F1C',
  bgCard: '#0F1D2E',
  bgSurface: '#162236',
  headerBg: '#070F1C',
  headerText: '#F8FAFC',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  borderColor: '#1E3A5F',
  tabBarBg: '#070F1C',
  tabBarActive: '#00C9E4',
  tabBarInactive: '#64748B',
  accentCyan: '#00C9E4',
  accentAmber: '#F59E0B',
  dangerRed: '#EF4444',
  warningOrange: '#F97316',
  safeGreen: '#10B981',
  cardShadow: '#000000',
};

export const lightColors = {
  theme: 'light',
  bgPrimary: '#F1F5F9',
  bgCard: '#FFFFFF',
  bgSurface: '#E2E8F0',
  headerBg: '#0B2545',
  headerText: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  borderColor: '#CBD5E1',
  tabBarBg: '#FFFFFF',
  tabBarActive: '#0284C7',
  tabBarInactive: '#64748B',
  accentCyan: '#00C9E4',
  accentAmber: '#F59E0B',
  dangerRed: '#EF4444',
  warningOrange: '#F97316',
  safeGreen: '#10B981',
  cardShadow: '#64748B',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Operator app defaults to dark for tactical control room operations
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save operator theme:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      isDark: true,
      colors: darkColors,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
