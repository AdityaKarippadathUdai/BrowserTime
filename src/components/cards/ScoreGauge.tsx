import React from 'react';
import { Award, Zap } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#3b82f6'; // default blue
  let glowColor = 'rgba(59, 130, 246, 0.4)';
  let label = 'Balanced';

  if (score >= 80) {
    color = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.4)';
    label = 'Highly Productive';
  } else if (score >= 60) {
    color = '#3b82f6'; // blue
    glowColor = 'rgba(59, 130, 246, 0.4)';
    label = 'Productive';
  } else if (score >= 40) {
    color = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    label = 'Moderate';
  } else {
    color = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.4)';
    label = 'Distracting';
  }

  return (
    <div className="flex flex-col items-center justify-center relative p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/40 dark:text-slate-800/60"
            fill="transparent"
          />
          {/* Active Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out',
              filter: `drop-shadow(0 0 10px ${glowColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Zap className="w-3.5 h-3.5" style={{ color }} /> Score
          </div>
          <span className="text-4xl font-extrabold tracking-tight mt-0.5" style={{ color }}>
            {score}
          </span>
          <span className="text-[11px] font-semibold tracking-wide uppercase mt-1 px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
