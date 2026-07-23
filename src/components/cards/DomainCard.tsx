import React from 'react';
import { CATEGORIES } from '../../constants/categories';
import { CategoryName } from '../../types';
import { formatDuration, formatPercentage, getFaviconUrl } from '../../utils/formatters';

interface DomainCardProps {
  domain: string;
  title?: string;
  timeSpent: number;
  totalDailyTime: number;
  category: CategoryName;
  favicon?: string;
  onClick?: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  title,
  timeSpent,
  totalDailyTime,
  category,
  favicon,
  onClick,
}) => {
  const percentage = totalDailyTime > 0 ? (timeSpent / totalDailyTime) * 100 : 0;
  const categoryInfo = CATEGORIES[category] || CATEGORIES.Other;
  const faviconUrl = favicon || getFaviconUrl(domain);

  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover p-4 flex items-center justify-between gap-4 cursor-pointer group transition-all duration-200"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <img
            src={faviconUrl}
            alt={domain}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
              {domain}
            </h4>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryInfo.badgeBg} ${categoryInfo.badgeText} shrink-0`}
            >
              {categoryInfo.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{title || domain}</p>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: categoryInfo.color,
              }}
            />
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-slate-100">{formatDuration(timeSpent)}</div>
        <div className="text-xs text-slate-400 font-medium">{formatPercentage(percentage)}</div>
      </div>
    </div>
  );
};
