import React, { createContext, useContext, useEffect, useState } from 'react';
import { browserAPI } from '../utils/browserApi';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'wtt_theme_preference';

function readStoredTheme(): Promise<Theme> {
  return new Promise((resolve) => {
    if (browserAPI?.storage?.local) {
      browserAPI.storage.local.get([THEME_STORAGE_KEY], (res) => {
        resolve((res?.[THEME_STORAGE_KEY] as Theme) || 'dark');
      });
      return;
    }

    const fallbackTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    resolve(fallbackTheme || 'dark');
  });
}

function persistTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  if (browserAPI?.storage?.local) {
    browserAPI.storage.local.set({ [THEME_STORAGE_KEY]: theme });
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isDark, setIsDark] = useState<boolean>(true);

  const applyTheme = (targetTheme: Theme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeDark = targetTheme === 'dark' || (targetTheme === 'system' && systemDark);

    setIsDark(activeDark);

    if (activeDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeTheme = async () => {
      const storedTheme = await readStoredTheme();
      if (cancelled) return;
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    };

    initializeTheme();

    if (browserAPI?.storage?.onChanged) {
      const handleStorageChange = (changes: { [key: string]: any }) => {
        const newTheme = changes[THEME_STORAGE_KEY]?.newValue as Theme | undefined;
        if (newTheme) {
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      };

      browserAPI.storage.onChanged.addListener(handleStorageChange);
      return () => {
        cancelled = true;
        browserAPI.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
