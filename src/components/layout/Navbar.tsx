import React from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar: React.FC = () => {
  return (
    <header className="glass-panel rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)', boxShadow: '0 12px 30px -16px var(--theme-shadow)' }}>
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--theme-text-primary)' }}>Website Time Tracker</h1>
          <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--theme-highlight)' }}>
            <ShieldCheck className="w-3 h-3" /> 100% Offline & Private
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
          <span>Active Focus Mode</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
