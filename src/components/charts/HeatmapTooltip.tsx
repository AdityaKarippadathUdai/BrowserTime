import React from 'react';
import { formatDuration, formatPercentage } from '../../utils/formatters';

interface HeatmapTooltipProps {
  visible: boolean;
  dateLabel: string;
  totalTime: number;
  productiveTime: number;
  distractingTime: number;
  websitesVisited: number;
  productivityScore: number;
}

export const HeatmapTooltip: React.FC<HeatmapTooltipProps> = React.memo(({ visible, dateLabel, totalTime, productiveTime, distractingTime, websitesVisited, productivityScore }) => {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute z-20 min-w-[180px] rounded-xl border px-3 py-2 text-xs shadow-2xl backdrop-blur-xl" style={{ backgroundColor: 'var(--theme-surface-strong)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
      <div className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{dateLabel}</div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between"><span>Total Time</span><span className="font-medium" style={{ color: 'var(--theme-accent)' }}>{formatDuration(totalTime)}</span></div>
        <div className="flex items-center justify-between"><span>Productive</span><span className="font-medium" style={{ color: '#4ade80' }}>{formatDuration(productiveTime)}</span></div>
        <div className="flex items-center justify-between"><span>Distracting</span><span className="font-medium" style={{ color: '#f87171' }}>{formatDuration(distractingTime)}</span></div>
        <div className="flex items-center justify-between"><span>Websites</span><span className="font-medium">{websitesVisited}</span></div>
        <div className="flex items-center justify-between"><span>Score</span><span className="font-medium" style={{ color: 'var(--theme-highlight)' }}>{formatPercentage(productivityScore / 100)}</span></div>
      </div>
    </div>
  );
});
