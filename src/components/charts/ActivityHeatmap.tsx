import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Sparkles } from 'lucide-react';
import { useStorage } from '../../contexts/StorageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DailyRecord, DomainStats } from '../../types';
import { calculateProductivityScore, getDomainCategory, getDomainProductivityType } from '../../utils/categorization';
import { formatDuration, formatPercentage, getFormattedDate } from '../../utils/formatters';
import { HeatmapCell } from './HeatmapCell';
import { HeatmapTooltip } from './HeatmapTooltip';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface HeatmapDaySummary {
  date: string;
  record: DailyRecord | null;
  totalTime: number;
  productiveTime: number;
  distractingTime: number;
  websitesVisited: number;
  productivityScore: number;
  level: number;
  label: string;
}

interface ActivityHeatmapProps {
  range?: '30d' | '90d' | '6m' | '1y';
  compact?: boolean;
}

const rangeOptions = [
  { value: '30d' as const, label: 'Last 30 Days' },
  { value: '90d' as const, label: 'Last 90 Days' },
  { value: '6m' as const, label: 'Last 6 Months' },
  { value: '1y' as const, label: 'Last Year' },
];

const getRangeDays = (range: ActivityHeatmapProps['range']) => {
  switch (range) {
    case '90d': return 90;
    case '6m': return 183;
    case '1y': return 365;
    default: return 30;
  }
};

const getDateLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = React.memo(({ range = '90d', compact = false }) => {
  const { domains, daily, settings } = useStorage();
  const { activePreset } = useTheme();
  const [selectedRange, setSelectedRange] = useState(range);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatmapDaySummary | null>(null);

  const heatmapData = useMemo(() => {
    const days = getRangeDays(selectedRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));

    const summaries: HeatmapDaySummary[] = [];
    const cursor = new Date(startDate);

    while (cursor <= endDate) {
      const dateStr = getFormattedDate(cursor);
      const rec = daily[dateStr] || { date: dateStr, domains: {}, productivityScore: 100, totalTime: 0 };
      const domainMap = rec.domains || {};
      const totalTime = Object.values(domainMap).reduce((sum, value) => sum + (value || 0), 0);

      let productiveTime = 0;
      let distractingTime = 0;
      Object.entries(domainMap).forEach(([domain, sec]) => {
        const pType = getDomainProductivityType(domain, settings);
        if (pType === 'productive') productiveTime += sec;
        else if (pType === 'distracting') distractingTime += sec;
      });

      const websitesVisited = Object.keys(domainMap).length;
      const productivityScore = totalTime > 0 ? calculateProductivityScore(domainMap, settings) : 100;
      const level = totalTime === 0 ? 0 : Math.min(4, Math.floor((totalTime / 14400) * 4));

      summaries.push({
        date: dateStr,
        record: rec.totalTime > 0 ? rec : null,
        totalTime,
        productiveTime,
        distractingTime,
        websitesVisited,
        productivityScore,
        level,
        label: getDateLabel(cursor),
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return summaries;
  }, [daily, selectedRange, settings]);

  const weeks = useMemo(() => {
    const cells = [...heatmapData];
    const weekGroups: HeatmapDaySummary[][] = [];
    while (cells.length) {
      weekGroups.push(cells.splice(0, 7));
    }
    return weekGroups;
  }, [heatmapData]);

  const stats = useMemo(() => {
    const activeDays = heatmapData.filter((entry) => entry.totalTime > 0).length;
    const totalTrackedSeconds = heatmapData.reduce((sum, entry) => sum + entry.totalTime, 0);
    const averageDailyTime = activeDays > 0 ? totalTrackedSeconds / activeDays : 0;
    const averageProductivity = heatmapData.filter((entry) => entry.totalTime > 0).reduce((sum, entry) => sum + entry.productivityScore, 0) / Math.max(1, activeDays);

    let currentStreak = 0;
    let longestStreak = 0;
    let run = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].totalTime > 0) {
        run += 1;
        longestStreak = Math.max(longestStreak, run);
      } else {
        run = 0;
      }
    }

    let cursor = heatmapData.length - 1;
    while (cursor >= 0 && heatmapData[cursor].totalTime > 0) {
      currentStreak += 1;
      cursor -= 1;
    }

    const mostActive = [...heatmapData].filter((entry) => entry.totalTime > 0).sort((a, b) => b.totalTime - a.totalTime)[0];
    const leastActive = [...heatmapData].filter((entry) => entry.totalTime > 0).sort((a, b) => a.totalTime - b.totalTime)[0];

    return {
      currentStreak,
      longestStreak,
      mostActiveDay: mostActive ? mostActive.label : 'No activity',
      leastActiveDay: leastActive ? leastActive.label : 'No activity',
      averageDailyTime,
      totalActiveDays: activeDays,
      totalTrackedHours: totalTrackedSeconds / 3600,
      averageProductivityScore: averageProductivity,
    };
  }, [heatmapData]);

  const renderSummary = (label: string, value: string, accent: string) => (
    <div className="glass-panel p-3 rounded-xl">
      <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>{label}</div>
      <div className="mt-1 text-sm font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  );

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
            <span className="inline-flex items-center gap-2"><CalendarDays className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} /> Activity Heatmap</span>
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            Browse your daily activity rhythm at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }} htmlFor="heatmap-range">
            Range
          </label>
          <div className="relative">
            <select
              id="heatmap-range"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as ActivityHeatmapProps['range'])}
              className="appearance-none rounded-xl border px-3 py-2 pr-8 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: '#0f172a' }}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--theme-text-muted)' }} />
          </div>
        </div>
      </div>

      {heatmapData.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-hover)' }}>
            <Sparkles className="h-6 w-6" style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>No browsing activity recorded yet.</div>
          <p className="mt-2 text-xs">The heatmap will appear here once browsing data is tracked.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-max">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>
                <span className="w-10 text-right">Mon</span>
                <span className="w-10 text-right">Tue</span>
                <span className="w-10 text-right">Wed</span>
                <span className="w-10 text-right">Thu</span>
                <span className="w-10 text-right">Fri</span>
                <span className="w-10 text-right">Sat</span>
                <span className="w-10 text-right">Sun</span>
              </div>
              <div className="flex gap-2">
                {weeks.map((week, weekIndex) => (
                  <div key={`${weekIndex}-${selectedRange}`} className="flex flex-col gap-2">
                    {week.map((day, dayIndex) => {
                      const isSelected = hoveredDate === day.date || selectedDay?.date === day.date;
                      return (
                        <div key={`${day.date}-${dayIndex}`} className="relative">
                          <HeatmapCell
                            day={day.record}
                            level={day.level}
                            dateLabel={day.label}
                            isSelected={isSelected}
                            onClick={() => setSelectedDay(day)}
                            onHover={setHoveredDate}
                            onFocus={setHoveredDate}
                          />
                          {hoveredDate === day.date ? (
                            <HeatmapTooltip
                              visible={hoveredDate === day.date}
                              dateLabel={day.label}
                              totalTime={day.totalTime}
                              productiveTime={day.productiveTime}
                              distractingTime={day.distractingTime}
                              websitesVisited={day.websitesVisited}
                              productivityScore={day.productivityScore}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {renderSummary('Current Streak', `${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`, 'var(--theme-accent)')}
            {renderSummary('Longest Streak', `${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}`, 'var(--theme-highlight)')}
            {renderSummary('Most Active Day', stats.mostActiveDay, 'var(--theme-primary)')}
            {renderSummary('Least Active Day', stats.leastActiveDay, 'var(--theme-text-secondary)')}
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {renderSummary('Average Daily Time', formatDuration(Math.round(stats.averageDailyTime)), 'var(--theme-accent)')}
            {renderSummary('Total Active Days', `${stats.totalActiveDays}`, 'var(--theme-highlight)')}
            {renderSummary('Tracked Hours', `${stats.totalTrackedHours.toFixed(1)}h`, 'var(--theme-primary)')}
            {renderSummary('Avg Productivity', formatPercentage(stats.averageProductivityScore / 100), 'var(--theme-text-secondary)')}
          </div>
        </div>
      )}

      {selectedDay ? (
        <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay.label}>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Total Browsing Time</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--theme-accent)' }}>{formatDuration(selectedDay.totalTime)}</div>
              </div>
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Productivity Score</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: 'var(--theme-highlight)' }}>{formatPercentage(selectedDay.productivityScore / 100)}</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Productive Time</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: '#4ade80' }}>{formatDuration(selectedDay.productiveTime)}</div>
              </div>
              <div className="glass-panel p-3 rounded-xl">
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Distracting Time</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: '#f87171' }}>{formatDuration(selectedDay.distractingTime)}</div>
              </div>
            </div>

            <div className="glass-panel p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Top Websites</div>
                <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{selectedDay.websitesVisited} visited</div>
              </div>
              {selectedDay.record && Object.keys(selectedDay.record.domains).length > 0 ? (
                <div className="mt-3 space-y-2">
                  {Object.entries(selectedDay.record.domains)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([domain, seconds]) => (
                      <div key={domain} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                        <span>{domain}</span>
                        <span style={{ color: 'var(--theme-accent)' }}>{formatDuration(seconds)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-3 text-sm" style={{ color: 'var(--theme-text-muted)' }}>No website detail captured for this day.</div>
              )}
            </div>

            <div className="glass-panel p-3 rounded-xl">
              <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--theme-text-muted)' }}>Category Breakdown</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDay.record ? Object.entries(selectedDay.record.domains).length > 0 ? (
                  Object.entries(selectedDay.record.domains)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([domain, seconds]) => (
                      <span key={domain} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                        {domain}: {formatDuration(seconds)}
                      </span>
                    ))
                ) : <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>No categories recorded</span> : <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>No categories recorded</span>}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
});
