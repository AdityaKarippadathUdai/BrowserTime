import React from 'react';
import { BarChart3, Clock, LayoutDashboard, Search, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'history', label: 'History & Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel rounded-none border-y-0 border-l-0 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--theme-primary)',
                      color: '#ffffff',
                      boxShadow: '0 12px 30px -16px var(--theme-shadow)',
                      border: '1px solid rgba(255,255,255,0.16)',
                    }
                  : {
                      color: 'var(--theme-text-muted)',
                      backgroundColor: 'transparent',
                    }
              }
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? '#ffffff' : 'var(--theme-text-muted)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-panel p-4 text-xs space-y-2" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-hover)' }}>
        <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--theme-accent)' }}>
          <Clock className="w-4 h-4" /> Pro Tip
        </div>
        <p className="leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          Productivity scores automatically recalculate based on category weightings and custom domain rules.
        </p>
      </div>
    </aside>
  );
};
