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
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            fontSize={11}
            domain={[0, 100]}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dayData = payload[0].payload as DayTrendPoint;
                return (
                  <div className="glass-panel p-3 text-xs shadow-xl border border-slate-700 space-y-1">
                    <div className="font-semibold text-slate-200">{dayData.day}</div>
                    <div className="text-indigo-400">
                      Time: {formatDuration(dayData.rawSeconds)}
                    </div>
                    <div className="text-emerald-400">Productivity Score: {dayData.score}/100</div>
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
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="score"
            name="Productivity Score"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
