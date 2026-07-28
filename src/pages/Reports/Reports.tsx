import React, { useState } from 'react';
import { Award, BarChart2, Calendar, CheckCircle2, Clock, ShieldAlert, Zap } from 'lucide-react';
import { DomainCard } from '../../components/cards/DomainCard';
import { UsageBarChart } from '../../components/charts/UsageBarChart';
import { ActivityHeatmap } from '../../components/charts/ActivityHeatmap';
import { useStorage } from '../../contexts/StorageContext';
import { DomainStats } from '../../types';
import {
  calculateProductivityScore,
  getDomainCategory,
  getDomainProductivityType,
} from '../../utils/categorization';
import { formatDuration, formatPercentage, getFormattedDate } from '../../utils/formatters';
import { WebsiteDetailModal } from '../WebsiteDetail/WebsiteDetailModal';

export const Reports: React.FC = () => {
  const { domains, daily, settings } = useStorage();
  const [selectedDomain, setSelectedDomain] = useState<DomainStats | null>(null);

  const nowMs = Date.now();
  let total7DayTime = 0;
  let productive7DayTime = 0;
  let distracting7DayTime = 0;

  let mostProductiveDay = { date: 'N/A', score: 0 };
  let mostDistractingDay = { date: 'N/A', score: 100 };

  const dailyTotalsBar: { label: string; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 86400 * 1000);
    const dateStr = getFormattedDate(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    const rec = daily[dateStr] || { domains: {} };
    const domainMap = rec.domains || {};

    let dayTotalSec = 0;
    let dayProdSec = 0;
    let dayDistSec = 0;

    Object.entries(domainMap).forEach(([dom, sec]) => {
      dayTotalSec += sec;
      const pType = getDomainProductivityType(dom, settings);
      if (pType === 'productive') dayProdSec += sec;
      else if (pType === 'distracting') dayDistSec += sec;
    });

    total7DayTime += dayTotalSec;
    productive7DayTime += dayProdSec;
    distracting7DayTime += dayDistSec;

    const dayScore = calculateProductivityScore(domainMap, settings);

    if (dayTotalSec > 0) {
      if (dayScore >= mostProductiveDay.score) {
        mostProductiveDay = { date: dayLabel, score: dayScore };
      }
      if (dayScore <= mostDistractingDay.score) {
        mostDistractingDay = { date: dayLabel, score: dayScore };
      }
    }

    dailyTotalsBar.push({
      label: dayLabel,
      minutes: Math.round(dayTotalSec / 60),
    });
  }

  const avgDailyTime = Math.round(total7DayTime / 7);
  const productivePct = total7DayTime > 0 ? (productive7DayTime / total7DayTime) * 100 : 0;
  const distractingPct = total7DayTime > 0 ? (distracting7DayTime / total7DayTime) * 100 : 0;

  // Most visited websites over 7 days
  const weeklyDomainTotals: { [dom: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const dateStr = getFormattedDate(new Date(nowMs - i * 86400 * 1000));
    const rec = daily[dateStr] || { domains: {} };
    Object.entries(rec.domains || {}).forEach(([dom, sec]) => {
      weeklyDomainTotals[dom] = (weeklyDomainTotals[dom] || 0) + sec;
    });
  }

  const sortedWeeklyWebsites = Object.entries(weeklyDomainTotals)
    .map(([domain, timeSpent]) => {
      const ds = domains[domain] || {
        domain,
        title: domain,
        totalTime: timeSpent,
        sessions: [],
        category: getDomainCategory(domain, settings),
        lastVisited: Date.now(),
      };
      return { ...ds, timeSpent };
    })
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">7-Day Analytics Report</h2>
          <p className="text-xs text-slate-400">Comprehensive overview of weekly browsing habits</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
          <Calendar className="w-4 h-4 text-indigo-400" /> Past 7 Days
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" /> Total Weekly Time
          </span>
          <div className="text-2xl font-bold text-slate-100">{formatDuration(total7DayTime)}</div>
          <div className="text-xs text-slate-400">Accumulated across all websites</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-cyan-400" /> Avg Daily Browsing
          </span>
          <div className="text-2xl font-bold text-slate-100">{formatDuration(avgDailyTime)}</div>
          <div className="text-xs text-slate-400">Per day average over 7 days</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Productive Time
          </span>
          <div className="text-2xl font-bold text-emerald-400">
            {formatDuration(productive7DayTime)}
          </div>
          <div className="text-xs text-slate-400">{formatPercentage(productivePct)} of total time</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Distracting Time
          </span>
          <div className="text-2xl font-bold text-red-400">
            {formatDuration(distracting7DayTime)}
          </div>
          <div className="text-xs text-slate-400">{formatPercentage(distractingPct)} of total time</div>
        </div>
      </div>

      <ActivityHeatmap range="180d" />

      {/* Productive vs Distracting Ratio & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Productivity Ratio
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Productive</span>
                <span className="text-slate-200">{formatPercentage(productivePct)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${productivePct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-red-400">Distracting</span>
                <span className="text-slate-200">{formatPercentage(distractingPct)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${distractingPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Most Productive Day:</span>
              <span className="font-bold text-emerald-400">
                {mostProductiveDay.date} ({mostProductiveDay.score} pts)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Most Distracting Day:</span>
              <span className="font-bold text-red-400">
                {mostDistractingDay.date} ({mostDistractingDay.score} pts)
              </span>
            </div>
          </div>
        </div>

        {/* Daily Totals Bar Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Daily Browsing Totals (Minutes)
          </h3>
          <UsageBarChart data={dailyTotalsBar} />
        </div>
      </div>

      {/* Top Websites List */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Top 10 Visited Websites (Past 7 Days)</h3>
        {sortedWeeklyWebsites.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No weekly data recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedWeeklyWebsites.map((item) => (
              <DomainCard
                key={item.domain}
                domain={item.domain}
                title={item.title}
                timeSpent={item.timeSpent}
                totalDailyTime={total7DayTime}
                category={getDomainCategory(item.domain, settings)}
                favicon={item.favicon}
                onClick={() => setSelectedDomain(domains[item.domain] || item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <WebsiteDetailModal
        isOpen={!!selectedDomain}
        onClose={() => setSelectedDomain(null)}
        domainStats={selectedDomain}
      />
    </div>
  );
};
