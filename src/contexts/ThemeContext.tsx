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
      browserAPI.storage.local.get([THEME_STORAGE_KEY], (res: any) => {
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
      browserAPI.storage.local.get([THEME_PRESET_STORAGE_KEY], (res: any) => {
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

const applyThemeVariables = (presetName: ThemePresetName, activeDark: boolean) => {
  if (typeof document === 'undefined') return;

  const preset = themePresets[presetName];
  const root = document.documentElement;

  const isLightMode = !activeDark;

  root.style.setProperty('--theme-background', isLightMode ? '#f8fafc' : preset.background);
  root.style.setProperty('--theme-surface', isLightMode ? 'rgba(255, 255, 255, 0.96)' : preset.surface);
  root.style.setProperty('--theme-surface-strong', isLightMode ? 'rgba(248, 250, 252, 0.98)' : preset.surfaceStrong);
  root.style.setProperty('--theme-border', isLightMode ? 'rgba(148, 163, 184, 0.32)' : preset.border);
  root.style.setProperty('--theme-text-primary', isLightMode ? '#0f172a' : preset.textPrimary);
  root.style.setProperty('--theme-text-secondary', isLightMode ? '#334155' : preset.textSecondary);
  root.style.setProperty('--theme-text-muted', isLightMode ? '#64748b' : preset.textMuted);
  root.style.setProperty('--theme-primary', preset.primary);
  root.style.setProperty('--theme-secondary', isLightMode ? '#0f766e' : preset.secondary);
  root.style.setProperty('--theme-accent', preset.accent);
  root.style.setProperty('--theme-highlight', isLightMode ? '#14b8a6' : preset.highlight);
  root.style.setProperty('--theme-hover', isLightMode ? 'rgba(37, 99, 235, 0.1)' : preset.hover);
  root.style.setProperty('--theme-shadow', isLightMode ? 'rgba(15, 23, 42, 0.16)' : preset.shadow);
  root.style.setProperty('--theme-pattern', isLightMode
    ? 'radial-gradient(circle at top left, rgba(37,99,235,0.1), transparent 32%), radial-gradient(circle at bottom right, rgba(34,211,238,0.08), transparent 40%)'
    : preset.pattern);
  root.style.setProperty('--theme-chart-1', preset.chartPalette[0]);
  root.style.setProperty('--theme-chart-2', preset.chartPalette[1] || preset.primary);
  root.style.setProperty('--theme-chart-3', preset.chartPalette[2] || preset.accent);
  root.style.setProperty('--theme-chart-4', preset.chartPalette[3] || preset.highlight);
  root.style.setProperty('--theme-chart-5', preset.chartPalette[4] || preset.secondary);
  root.style.setProperty('--theme-heatmap-0', isLightMode ? 'rgba(148, 163, 184, 0.22)' : 'rgba(148, 163, 184, 0.18)');
  root.style.setProperty('--theme-heatmap-1', isLightMode ? 'rgba(59, 130, 246, 0.26)' : `${preset.primary}33`);
  root.style.setProperty('--theme-heatmap-2', isLightMode ? 'rgba(59, 130, 246, 0.4)' : `${preset.primary}5d`);
  root.style.setProperty('--theme-heatmap-3', isLightMode ? 'rgba(37, 99, 235, 0.62)' : `${preset.primary}8f`);
  root.style.setProperty('--theme-heatmap-4', isLightMode ? 'rgba(29, 78, 216, 0.82)' : preset.primary);
  root.style.setProperty('--theme-transition', '220ms ease');
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
    applyThemeVariables(targetPreset, activeDark);

    root.classList.toggle('dark', activeDark);
    root.classList.toggle('light', !activeDark);
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
    if (typeof window === 'undefined') return;

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => applyTheme(theme, preset);

    mediaQuery.addEventListener?.('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener?.('change', handleSystemThemeChange);
  }, [theme, preset]);

  useEffect(() => {
    applyTheme(theme, preset);
    persistTheme(theme);
    persistPreset(preset);
  }, [theme, preset]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
    applyTheme(newTheme, preset);
  };

  const setPreset = (newPreset: ThemePresetName) => {
    setPresetState(newPreset);
    persistPreset(newPreset);
    applyTheme(theme, newPreset);
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
