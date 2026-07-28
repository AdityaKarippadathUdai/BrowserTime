import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { browserAPI } from '../utils/browserApi';
import { ThemeMode, ThemePreset, ThemePresetName, themePresets } from '../styles/themes';

type Theme = ThemeMode;

interface ThemeContextType {
  theme: Theme;
  preset: ThemePresetName;
  setTheme: (theme: Theme) => void;
  setPreset: (preset: ThemePresetName) => void;
  isDark: boolean;
  activePreset: ThemePreset;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'wtt_theme_preference';
const THEME_PRESET_STORAGE_KEY = 'wtt_theme_preset';

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

function readStoredPreset(): Promise<ThemePresetName> {
  return new Promise((resolve) => {
    if (browserAPI?.storage?.local) {
      browserAPI.storage.local.get([THEME_PRESET_STORAGE_KEY], (res) => {
        resolve((res?.[THEME_PRESET_STORAGE_KEY] as ThemePresetName) || 'glassmorphic-blue');
      });
      return;
    }

    const fallbackPreset = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY) as ThemePresetName | null;
    resolve(fallbackPreset || 'glassmorphic-blue');
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

function persistPreset(preset: ThemePresetName): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, preset);
  }

  if (browserAPI?.storage?.local) {
    browserAPI.storage.local.set({ [THEME_PRESET_STORAGE_KEY]: preset });
  }
}

const applyThemeVariables = (presetName: ThemePresetName) => {
  if (typeof document === 'undefined') return;

  const preset = themePresets[presetName];
  const root = document.documentElement;

  root.style.setProperty('--theme-background', preset.background);
  root.style.setProperty('--theme-surface', preset.surface);
  root.style.setProperty('--theme-surface-strong', preset.surfaceStrong);
  root.style.setProperty('--theme-border', preset.border);
  root.style.setProperty('--theme-text-primary', preset.textPrimary);
  root.style.setProperty('--theme-text-secondary', preset.textSecondary);
  root.style.setProperty('--theme-text-muted', preset.textMuted);
  root.style.setProperty('--theme-primary', preset.primary);
  root.style.setProperty('--theme-secondary', preset.secondary);
  root.style.setProperty('--theme-accent', preset.accent);
  root.style.setProperty('--theme-highlight', preset.highlight);
  root.style.setProperty('--theme-hover', preset.hover);
  root.style.setProperty('--theme-shadow', preset.shadow);
  root.style.setProperty('--theme-pattern', preset.pattern);
  root.style.setProperty('--theme-chart-1', preset.chartPalette[0]);
  root.style.setProperty('--theme-chart-2', preset.chartPalette[1] || preset.primary);
  root.style.setProperty('--theme-chart-3', preset.chartPalette[2] || preset.accent);
  root.style.setProperty('--theme-chart-4', preset.chartPalette[3] || preset.highlight);
  root.style.setProperty('--theme-chart-5', preset.chartPalette[4] || preset.secondary);
  root.style.setProperty('--theme-transition', '200ms ease');
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [preset, setPresetState] = useState<ThemePresetName>('glassmorphic-blue');
  const [isDark, setIsDark] = useState<boolean>(true);

  const applyTheme = (targetTheme: Theme, targetPreset: ThemePresetName) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeDark = targetTheme === 'dark' || (targetTheme === 'system' && systemDark);

    setIsDark(activeDark);
    applyThemeVariables(targetPreset);

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
      const storedPreset = await readStoredPreset();
      if (cancelled) return;
      setThemeState(storedTheme);
      setPresetState(storedPreset);
      applyTheme(storedTheme, storedPreset);
    };

    initializeTheme();

    if (browserAPI?.storage?.onChanged) {
      const handleStorageChange = (changes: { [key: string]: any }) => {
        const newTheme = changes[THEME_STORAGE_KEY]?.newValue as Theme | undefined;
        const newPreset = changes[THEME_PRESET_STORAGE_KEY]?.newValue as ThemePresetName | undefined;
        if (newTheme) {
          setThemeState(newTheme);
          applyTheme(newTheme, preset);
        }
        if (newPreset) {
          setPresetState(newPreset);
          applyTheme(theme, newPreset);
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
    applyTheme(theme, preset);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme, preset);
    persistPreset(preset);
  }, [preset]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setPreset = (newPreset: ThemePresetName) => {
    setPresetState(newPreset);
  };

  const activePreset = useMemo(() => themePresets[preset], [preset]);

  return (
    <ThemeContext.Provider value={{ theme, preset, setTheme, setPreset, isDark, activePreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
