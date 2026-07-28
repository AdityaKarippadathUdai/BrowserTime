export type ThemeMode = 'dark' | 'light' | 'system';

export type ThemePresetName =
  | 'glassmorphic-blue'
  | 'glassmorphic-green'
  | 'glassmorphic-crimson'
  | 'cyberpunk'
  | 'midnight-blue'
  | 'amoled-black'
  | 'ocean';

export interface ThemePreset {
  name: string;
  background: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  hover: string;
  shadow: string;
  pattern: string;
  chartPalette: string[];
}

export const themePresets: Record<ThemePresetName, ThemePreset> = {
  'glassmorphic-blue': {
    name: 'Glassmorphic Blue',
    background: '#050816',
    surface: 'rgba(15, 23, 42, 0.72)',
    surfaceStrong: 'rgba(15, 23, 42, 0.9)',
    border: 'rgba(148, 163, 184, 0.18)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#87a4bb',
    primary: '#2563EB',
    secondary: '#22D3EE',
    accent: '#60A5FA',
    highlight: '#38BDF8',
    hover: 'rgba(37, 99, 235, 0.16)',
    shadow: 'rgba(37, 99, 235, 0.3)',
    pattern: 'radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(34,211,238,0.14), transparent 40%)',
    chartPalette: ['#2563EB', '#22D3EE', '#60A5FA', '#38BDF8', '#818CF8'],
  },
  'glassmorphic-green': {
    name: 'Glassmorphic Green',
    background: '#050816',
    surface: 'rgba(7, 16, 15, 0.74)',
    surfaceStrong: 'rgba(10, 22, 19, 0.92)',
    border: 'rgba(74, 222, 128, 0.2)',
    textPrimary: '#f0fdf4',
    textSecondary: '#dcfce7',
    textMuted: '#8ec79c',
    primary: '#16A34A',
    secondary: '#22C55E',
    accent: '#4ADE80',
    highlight: '#86EFAC',
    hover: 'rgba(22, 163, 74, 0.15)',
    shadow: 'rgba(34, 197, 94, 0.26)',
    pattern: 'radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(74,222,128,0.12), transparent 42%)',
    chartPalette: ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#34D399'],
  },
  'glassmorphic-crimson': {
    name: 'Glassmorphic Crimson',
    background: '#050505',
    surface: 'rgba(17, 17, 17, 0.82)',
    surfaceStrong: 'rgba(22, 22, 22, 0.94)',
    border: 'rgba(248, 113, 113, 0.2)',
    textPrimary: '#fef2f2',
    textSecondary: '#fecaca',
    textMuted: '#fda4af',
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#F87171',
    highlight: '#FB7185',
    hover: 'rgba(220, 38, 38, 0.16)',
    shadow: 'rgba(239, 68, 68, 0.24)',
    pattern: 'radial-gradient(circle at top left, rgba(220,38,38,0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(248,113,113,0.13), transparent 40%)',
    chartPalette: ['#DC2626', '#EF4444', '#F87171', '#FB7185', '#FCA5A5'],
  },
  cyberpunk: {
    name: 'Cyberpunk',
    background: '#030712',
    surface: 'rgba(11, 17, 32, 0.82)',
    surfaceStrong: 'rgba(17, 24, 39, 0.94)',
    border: 'rgba(236, 72, 153, 0.22)',
    textPrimary: '#fdf2f8',
    textSecondary: '#f5d0fe',
    textMuted: '#a78bfa',
    primary: '#7C3AED',
    secondary: '#06B6D4',
    accent: '#EC4899',
    highlight: '#F472B6',
    hover: 'rgba(7, 182, 212, 0.16)',
    shadow: 'rgba(236, 72, 153, 0.28)',
    pattern: 'linear-gradient(rgba(6, 182, 212, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.12) 1px, transparent 1px), radial-gradient(circle at top left, rgba(124,58,237,0.15), transparent 32%), radial-gradient(circle at bottom right, rgba(236,72,153,0.14), transparent 45%)',
    chartPalette: ['#7C3AED', '#06B6D4', '#EC4899', '#8B5CF6', '#F472B6'],
  },
  'midnight-blue': {
    name: 'Midnight Blue',
    background: '#0F172A',
    surface: 'rgba(15, 23, 42, 0.8)',
    surfaceStrong: 'rgba(30, 41, 59, 0.94)',
    border: 'rgba(96, 165, 250, 0.2)',
    textPrimary: '#f8fafc',
    textSecondary: '#dbeafe',
    textMuted: '#93c5fd',
    primary: '#1D4ED8',
    secondary: '#3B82F6',
    accent: '#60A5FA',
    highlight: '#93C5FD',
    hover: 'rgba(29, 78, 216, 0.16)',
    shadow: 'rgba(59, 130, 246, 0.26)',
    pattern: 'radial-gradient(circle at top left, rgba(29,78,216,0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(96,165,250,0.12), transparent 44%)',
    chartPalette: ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  },
  'amoled-black': {
    name: 'AMOLED Black',
    background: '#000000',
    surface: 'rgba(8, 8, 8, 0.95)',
    surfaceStrong: 'rgba(15, 15, 15, 0.98)',
    border: 'rgba(96, 165, 250, 0.16)',
    textPrimary: '#f9fafb',
    textSecondary: '#e5e7eb',
    textMuted: '#9ca3af',
    primary: '#2563EB',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    highlight: '#BFDBFE',
    hover: 'rgba(37, 99, 235, 0.14)',
    shadow: 'rgba(96, 165, 250, 0.2)',
    pattern: 'radial-gradient(circle at top left, rgba(37,99,235,0.1), transparent 32%)',
    chartPalette: ['#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  },
  ocean: {
    name: 'Ocean',
    background: '#082F49',
    surface: 'rgba(8, 47, 73, 0.8)',
    surfaceStrong: 'rgba(12, 74, 110, 0.94)',
    border: 'rgba(34, 211, 238, 0.2)',
    textPrimary: '#f0fdfa',
    textSecondary: '#bae6fd',
    textMuted: '#7dd3fc',
    primary: '#0891B2',
    secondary: '#22D3EE',
    accent: '#67E8F9',
    highlight: '#A5F3FC',
    hover: 'rgba(8, 145, 178, 0.16)',
    shadow: 'rgba(34, 211, 238, 0.24)',
    pattern: 'radial-gradient(circle at top left, rgba(8,145,178,0.16), transparent 34%), radial-gradient(circle at bottom right, rgba(34,211,238,0.12), transparent 45%)',
    chartPalette: ['#0891B2', '#22D3EE', '#67E8F9', '#A5F3FC', '#67E8F9'],
  },
};

export const presetOptions = Object.entries(themePresets).map(([value, preset]) => ({
  value: value as ThemePresetName,
  label: preset.name,
  preview: preset.chartPalette,
}));
