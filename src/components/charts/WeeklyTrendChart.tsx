import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDuration } from '../../utils/formatters';

interface DayTrendPoint {
  day: string; // e.g. Mon, Tue
  hours: number;
  score: number;
  rawSeconds: number;
}

interface WeeklyTrendChartProps {
  data: DayTrendPoint[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data }) => {
  const { activePreset } = useTheme();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
          <XAxis dataKey="day" stroke="var(--theme-text-muted)" fontSize={11} tickLine={false} />
          <YAxis yAxisId="left" stroke="var(--theme-text-muted)" fontSize={11} tickLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--theme-text-muted)"
            fontSize={11}
            domain={[0, 100]}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dayData = payload[0].payload as DayTrendPoint;
                return (
                  <div className="glass-panel p-3 text-xs shadow-xl space-y-1" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>{dayData.day}</div>
                    <div style={{ color: 'var(--theme-accent)' }}>
                      Time: {formatDuration(dayData.rawSeconds)}
                    </div>
                    <div style={{ color: 'var(--theme-highlight)' }}>Productivity Score: {dayData.score}/100</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="hours"
            name="Browsing Time (hrs)"
            stroke={activePreset.chartPalette[0]}
            strokeWidth={3}
            dot={{ r: 4, fill: activePreset.chartPalette[0] }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="score"
            name="Productivity Score"
            stroke={activePreset.chartPalette[1] || activePreset.primary}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: activePreset.chartPalette[1] || activePreset.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
