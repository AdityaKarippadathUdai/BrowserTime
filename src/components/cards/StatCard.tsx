import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
  bgColor = 'bg-indigo-500/10',
  badgeText,
  badgeType = 'info',
}) => {
  return (
    <div className="glass-panel glass-panel-hover p-5 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-100 mb-1">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}
      </div>
      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center justify-between">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
              badgeType === 'success'
                ? 'bg-emerald-500/10 text-emerald-400'
                : badgeType === 'warning'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-indigo-500/10 text-indigo-400'
            }`}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
