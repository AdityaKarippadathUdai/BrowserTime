import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDuration } from '../../utils/formatters';

interface UsageDataPoint {
  label: string;
  minutes: number;
}

interface UsageBarChartProps {
  data: UsageDataPoint[];
}

export const UsageBarChart: React.FC<UsageBarChartProps> = ({ data }) => {
  const { activePreset } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
        No usage data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--theme-text-muted)"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="var(--theme-text-muted)" fontSize={11} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const mins = item.value as number;
                return (
                  <div className="glass-panel p-2.5 text-xs shadow-xl" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>{item.payload.label}</div>
                    <div className="font-bold mt-1" style={{ color: 'var(--theme-accent)' }}>
                      {formatDuration(mins * 60)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="minutes" fill={activePreset.chartPalette[0]} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
