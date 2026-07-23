import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDuration } from '../../utils/formatters';

interface UsageDataPoint {
  label: string;
  minutes: number;
}

interface UsageBarChartProps {
  data: UsageDataPoint[];
}

export const UsageBarChart: React.FC<UsageBarChartProps> = ({ data }) => {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const mins = item.value as number;
                return (
                  <div className="glass-panel p-2.5 text-xs shadow-xl border border-slate-700">
                    <div className="font-semibold text-slate-200">{item.payload.label}</div>
                    <div className="text-indigo-400 font-bold mt-1">
                      {formatDuration(mins * 60)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
