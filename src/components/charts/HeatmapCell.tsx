import React from 'react';
import { Activity } from 'lucide-react';
import { DailyRecord } from '../../types';

interface HeatmapCellProps {
  day: DailyRecord | null;
  level: number;
  dateLabel: string;
  isSelected: boolean;
  onClick: () => void;
  onHover: (date: string | null) => void;
  onFocus: (date: string | null) => void;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = React.memo((props) => {
  const { day, level, dateLabel, isSelected, onClick, onHover, onFocus } = props;

  const palette = [
    'var(--theme-heatmap-0)',
    'var(--theme-heatmap-1)',
    'var(--theme-heatmap-2)',
    'var(--theme-heatmap-3)',
    'var(--theme-heatmap-4)',
  ];

  const cellStyle = {
    backgroundColor: day ? palette[level] : 'rgba(148, 163, 184, 0.08)',
    borderColor: isSelected ? 'var(--theme-accent)' : 'rgba(255,255,255,0.04)',
    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isSelected ? '0 0 0 1px var(--theme-accent), 0 10px 24px -16px var(--theme-shadow)' : 'none',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover(dateLabel)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocus(dateLabel)}
      onBlur={() => onFocus(null)}
      className="relative h-3.5 w-3.5 rounded-[4px] border transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={cellStyle}
      aria-label={day ? `${dateLabel} — ${day.totalTime ? 'active' : 'no activity'}` : `${dateLabel} — no activity`}
      title={day ? `${dateLabel}` : undefined}
    >
      {day && day.totalTime > 0 ? (
        <span className="absolute inset-0 flex items-center justify-center opacity-70">
          <Activity className="w-2 h-2" style={{ color: 'rgba(255,255,255,0.75)' }} />
        </span>
      ) : null}
    </button>
  );
});
