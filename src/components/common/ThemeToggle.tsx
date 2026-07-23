import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40 transition-all duration-200"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
    </button>
  );
};
