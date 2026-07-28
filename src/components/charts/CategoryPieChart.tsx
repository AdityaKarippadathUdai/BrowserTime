import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES } from '../../constants/categories';
import { useTheme } from '../../contexts/ThemeContext';
import { CategoryName } from '../../types';
import { formatDuration } from '../../utils/formatters';

interface CategoryDataPoint {
  name: CategoryName;
  value: number; // seconds
}

interface CategoryPieChartProps {
  data: CategoryDataPoint[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const { activePreset } = useTheme();
  const filteredData = data.filter((d) => d.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
        No category browsing data recorded yet today.
      </div>
    );
  }

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORIES[entry.name]?.color || '#6b7280'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const catName = item.name as CategoryName;
                const value = item.value as number;
                return (
                  <div className="glass-panel p-3 text-xs shadow-xl" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>{catName}</div>
                    <div className="mt-1" style={{ color: 'var(--theme-text-muted)' }}>{formatDuration(value)}</div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend below */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {filteredData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORIES[entry.name]?.color || '#6b7280' }}
            />
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
