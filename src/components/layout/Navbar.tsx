import React from 'react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar: React.FC = () => {
  return (
    <header className="glass-panel rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">Website Time Tracker</h1>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" /> 100% Offline & Private
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Focus Mode</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
