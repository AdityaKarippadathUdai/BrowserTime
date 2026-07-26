import React, { useState } from 'react';
import { Award, Clock, Flame, Globe, TrendingUp, Zap } from 'lucide-react';
import { DomainCard } from '../../components/cards/DomainCard';
import { ScoreGauge } from '../../components/cards/ScoreGauge';
import { StatCard } from '../../components/cards/StatCard';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { UsageBarChart } from '../../components/charts/UsageBarChart';
import { WeeklyTrendChart } from '../../components/charts/WeeklyTrendChart';
import { useStorage } from '../../contexts/StorageContext';
import { CategoryName, DomainStats } from '../../types';
import { calculateProductivityScore, getDomainCategory } from '../../utils/categorization';
import { formatDuration, getFormattedDate } from '../../utils/formatters';
import { WebsiteDetailModal } from '../WebsiteDetail/WebsiteDetailModal';

export const Dashboard: React.FC = () => {
  const { domains, daily, settings, activeState } = useStorage();
  const [selectedDomain, setSelectedDomain] = useState<DomainStats | null>(null);

  const todayStr = getFormattedDate();
  const todayRecord = daily[todayStr] || { date: todayStr, domains: {}, productivityScore: 100, totalTime: 0 };
  const todayDomainMap = todayRecord.domains || {};

  const activeDurationSeconds = activeState?.domain && activeState.startTime
    ? Math.max(0, Math.floor((Date.now() - activeState.startTime) / 1000))
    : 0;

  const liveTodayDomainMap = { ...todayDomainMap };
  if (activeState?.domain) {
    liveTodayDomainMap[activeState.domain] = (liveTodayDomainMap[activeState.domain] || 0) + activeDurationSeconds;
  }

  // 1. Today's Total Time
  const todayTotalTime = Object.values(liveTodayDomainMap).reduce((a, b) => a + b, 0);

  // 2. Today's Productivity Score
  const score = calculateProductivityScore(liveTodayDomainMap, settings);

  // 3. Weekly Time calculation (last 7 days)
  const nowMs = Date.now();
  let weeklyTotalTime = 0;
  const last7DaysData: { day: string; hours: number; score: number; rawSeconds: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 86400 * 1000);
    const dateStr = getFormattedDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const rec = daily[dateStr] || { domains: {} };
    const daySecs = Object.values(rec.domains || {}).reduce((a, b) => a + b, 0);

    weeklyTotalTime += daySecs;
    const dayScore = calculateProductivityScore(rec.domains || {}, settings);

    last7DaysData.push({
      day: dayName,
      hours: Number((daySecs / 3600).toFixed(1)),
      score: dayScore,
      rawSeconds: daySecs,
    });
  }

  // 4. Most Used Site Today
  let mostUsedDomain = 'None';
  let maxTimeToday = 0;
  Object.entries(liveTodayDomainMap).forEach(([domain, sec]) => {
    if (sec > maxTimeToday) {
      maxTimeToday = sec;
      mostUsedDomain = domain;
    }
  });

  // 5. Longest Session
  let longestSessionSecs = 0;
  let longestSessionDomain = 'None';
  Object.values(domains).forEach((ds) => {
    (ds.sessions || []).forEach((s) => {
      if (s.duration > longestSessionSecs) {
        longestSessionSecs = s.duration;
        longestSessionDomain = ds.domain;
      }
    });
  });

  // 6. Top 5 Websites Today
  const topWebsites = Object.entries(liveTodayDomainMap)
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
    .slice(0, 5);

  // 7. Category Pie Chart Data
  const categoryTotals: Record<CategoryName, number> = {
    Development: 0,
    Learning: 0,
    Docs: 0,
    Entertainment: 0,
    Social: 0,
    Messaging: 0,
    Other: 0,
  };

  Object.entries(liveTodayDomainMap).forEach(([domain, sec]) => {
    const cat = getDomainCategory(domain, settings);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + sec;
  });

  const categoryPieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name as CategoryName,
    value,
  }));

  // 8. Usage Bar Chart Data
  const usageBarData = topWebsites.map((item) => ({
    label: item.domain,
    minutes: Math.round(item.timeSpent / 60),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Time"
          value={formatDuration(todayTotalTime)}
          subtitle="Total active time recorded today"
          icon={Clock}
          iconColor="text-indigo-400"
          bgColor="bg-indigo-500/10"
          badgeText="Active Track"
          badgeType="info"
        />
        <StatCard
          title="Weekly Time"
          value={formatDuration(weeklyTotalTime)}
          subtitle="Past 7 days accumulated time"
          icon={TrendingUp}
          iconColor="text-cyan-400"
          bgColor="bg-cyan-500/10"
          badgeText="7-Day Summary"
          badgeType="info"
        />
        <StatCard
          title="Most Used Site"
          value={mostUsedDomain}
          subtitle={maxTimeToday > 0 ? formatDuration(maxTimeToday) : 'No usage today'}
          icon={Globe}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/10"
          badgeText="Top Site"
          badgeType="success"
        />
        <StatCard
          title="Longest Session"
          value={longestSessionDomain}
          subtitle={longestSessionSecs > 0 ? formatDuration(longestSessionSecs) : 'No session recorded'}
          icon={Flame}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10"
          badgeText="Peak Focus"
          badgeType="warning"
        />
      </div>

      {/* Main Highlights Row: Score Gauge & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Score Gauge */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Productivity Score
            </h3>
            <span className="text-xs text-slate-400 font-medium">Today</span>
          </div>

          <ScoreGauge score={score} size={200} />

          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Calculated automatically based on website categories & active focus duration.
          </p>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Category Distribution
            </h3>
            <span className="text-xs text-slate-400 font-medium">Today's breakdown</span>
          </div>
          <CategoryPieChart data={categoryPieData} />
        </div>
      </div>

      {/* Weekly Trend & Usage Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            7-Day Browsing & Score Trend
          </h3>
          <WeeklyTrendChart data={last7DaysData} />
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Top Sites Usage (Minutes)
          </h3>
          <UsageBarChart data={usageBarData} />
        </div>
      </div>

      {/* Today's Top Websites List */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Today's Most Visited Websites</h3>
            <p className="text-xs text-slate-400">Click any website to view detailed analytics</p>
          </div>
          <span className="text-xs font-semibold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            {topWebsites.length} Active Domains
          </span>
        </div>

        {topWebsites.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No browsing history recorded today yet. Start browsing to track time automatically!
          </div>
        ) : (
          <div className="space-y-3">
            {topWebsites.map((item) => (
              <DomainCard
                key={item.domain}
                domain={item.domain}
                title={item.title}
                timeSpent={item.timeSpent}
                totalDailyTime={todayTotalTime}
                category={getDomainCategory(item.domain, settings)}
                favicon={item.favicon}
                onClick={() => setSelectedDomain(domains[item.domain] || item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Website Detail Modal */}
      <WebsiteDetailModal
        isOpen={!!selectedDomain}
        onClose={() => setSelectedDomain(null)}
        domainStats={selectedDomain}
      />
    </div>
  );
};
