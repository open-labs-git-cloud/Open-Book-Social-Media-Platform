import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'light' | 'dark' | 'valentine' | 'christmas' | 'easter' | 'summer';
export type ThemeMode = 'auto' | 'manual';

interface Theme {
  name: ThemeName;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
}

const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    primary: '#1877f2',
    secondary: '#42b72a',
    background: '#f0f2f5',
    surface: '#ffffff',
    text: '#050505',
    textSecondary: '#65676b',
    border: '#e4e6eb',
    hover: '#f2f3f5',
  },
  dark: {
    name: 'dark',
    primary: '#2d88ff',
    secondary: '#42b72a',
    background: '#18191a',
    surface: '#242526',
    text: '#e4e6eb',
    textSecondary: '#b0b3b8',
    border: '#3e4042',
    hover: '#3a3b3c',
  },
  valentine: {
    name: 'valentine',
    primary: '#ff1493',
    secondary: '#ff69b4',
    background: '#fff0f5',
    surface: '#ffffff',
    text: '#4d0026',
    textSecondary: '#8b004d',
    border: '#ffb6d9',
    hover: '#ffe4f0',
  },
  christmas: {
    name: 'christmas',
    primary: '#c41e3a',
    secondary: '#0f7e3e',
    background: '#f5f5f0',
    surface: '#ffffff',
    text: '#1a3d2e',
    textSecondary: '#4d6d5a',
    border: '#d4e8dd',
    hover: '#e8f5ed',
  },
  easter: {
    name: 'easter',
    primary: '#9b59b6',
    secondary: '#f1c40f',
    background: '#fef9e7',
    surface: '#ffffff',
    text: '#4a235a',
    textSecondary: '#7d3c98',
    border: '#e8daef',
    hover: '#f4ecf7',
  },
  summer: {
    name: 'summer',
    primary: '#ff6b35',
    secondary: '#f7b801',
    background: '#fffacd',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#5d6d7e',
    border: '#ffeaa7',
    hover: '#fff5d7',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName; // the applied theme name (may be event-driven when mode === 'auto')
  userSelectedTheme: ThemeName; // the user's manual selection
  mode: ThemeMode;
  setTheme: (themeName: ThemeName) => void; // sets userSelectedTheme and switches to manual
  setMode: (mode: ThemeMode) => void;
  eventTheme: ThemeName | null; // current event-driven theme if any
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // userSelectedTheme holds the user's manual preference
  const [userSelectedTheme, setUserSelectedTheme] = useState<ThemeName>('light');
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    const savedTheme = localStorage.getItem('openbook-theme') as ThemeName | null;
    const savedMode = (localStorage.getItem('openbook-theme-mode') as ThemeMode) || null;
    if (savedTheme && themes[savedTheme]) {
      setUserSelectedTheme(savedTheme);
    }
    if (savedMode) {
      setModeState(savedMode);
    }
  }, []);

  const setTheme = (name: ThemeName) => {
    // when user explicitly picks a theme, switch to manual mode
    setUserSelectedTheme(name);
    localStorage.setItem('openbook-theme', name);
    localStorage.setItem('openbook-theme-mode', 'manual');
    setModeState('manual');
  };

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem('openbook-theme-mode', m);
  };

  // compute event-driven theme based on date ranges
  const getEventTheme = (d = new Date()): ThemeName | null => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    const day = d.getDate();

    // Valentine's: Feb 10-16
    if (month === 2 && day >= 10 && day <= 16) return 'valentine';

    // Christmas: Dec 20 - Jan 2
    if ((month === 12 && day >= 20) || (month === 1 && day <= 2)) return 'christmas';

    // Easter: approximate as Apr 1-7 (placeholder; can be replaced with proper calculation)
    if (month === 4 && day >= 1 && day <= 7) return 'easter';

    // Summer (Southern hemisphere): Dec 1 - Feb 28/29
    if ((month === 12) || (month === 1) || (month === 2)) return 'summer';

    return null;
  };

  const eventTheme = getEventTheme();

  // appliedThemeName depends on mode: manual -> userSelectedTheme, auto -> eventTheme || userSelectedTheme
  const appliedThemeName: ThemeName = mode === 'manual' ? userSelectedTheme : (eventTheme ?? userSelectedTheme);

  const theme = themes[appliedThemeName];

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-hover', theme.hover);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName: appliedThemeName, userSelectedTheme, mode, setTheme, setMode, eventTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
