import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: 'var(--theme-surface)',
        border: '1px solid var(--theme-border)',
        color: 'var(--theme-text-secondary)',
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? <Sun className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} /> : <Moon className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />}
    </button>
  );
};
