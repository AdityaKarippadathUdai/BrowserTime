import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, Globe, ShieldCheck, Zap } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { StorageProvider, useStorage } from '../contexts/StorageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { browserAPI } from '../utils/browserApi';
import { calculateProductivityScore, getDomainCategory } from '../utils/categorization';
import { formatDuration, getFaviconUrl, getFormattedDate } from '../utils/formatters';
import '../styles/index.css';

const PopupContent: React.FC = () => {
  const { domains, daily, settings } = useStorage();
  const { isDark, setTheme } = useTheme();

  const [currentSession, setCurrentSession] = useState<{
    domain: string | null;
    title: string | null;
    favicon: string | null;
    currentSeconds: number;
    isTracking: boolean;
  }>({
    domain: null,
    title: null,
    favicon: null,
    currentSeconds: 0,
    isTracking: false,
  });

  // Query active background session timer every second
  useEffect(() => {
    const fetchCurrentSession = () => {
      if (browserAPI && browserAPI.runtime) {
        try {
          browserAPI.runtime.sendMessage({ type: 'GET_CURRENT_SESSION' }, (response) => {
            if (response) {
              setCurrentSession(response);
            }
          });
        } catch (e) {
          // Ignore messaging errors
        }
      }
    };

    fetchCurrentSession();
    const interval = setInterval(fetchCurrentSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getFormattedDate();
  const todayRecord = daily[todayStr] || { domains: {} };
  const todayDomainMap = todayRecord.domains || {};

  const todayTotalTime = Object.values(todayDomainMap).reduce((a, b) => a + b, 0);
  const todayProductivityScore = calculateProductivityScore(todayDomainMap, settings);

  // Top 5 websites today
  const top5Websites = Object.entries(todayDomainMap)
    .map(([dom, sec]) => ({
      domain: dom,
      timeSpent: sec,
      favicon: domains[dom]?.favicon || getFaviconUrl(dom),
      category: getDomainCategory(dom, settings),
    }))
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 5);

  const handleOpenDashboard = () => {
    if (browserAPI?.runtime) {
      browserAPI.runtime.sendMessage({ type: 'OPEN_DASHBOARD' }, () => {
        if (browserAPI.runtime.lastError) {
          const dashboardUrl = browserAPI.runtime.getURL('dashboard.html');
          browserAPI.tabs.create({ url: dashboardUrl });
        }
      });
      return;
    }

    window.open('/dashboard.html', '_blank');
  };

  return (
    <div className="w-[360px] min-h-[480px] bg-slate-950 text-slate-100 p-4 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-slate-100">Time Tracker</h1>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Offline Active
              </span>
            </div>
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Current Website Live Card */}
        <div className="glass-panel p-3.5 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Current Tab
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                currentSession.isTracking
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {currentSession.isTracking ? 'Tracking Live' : 'Paused / Off-tab'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={
                currentSession.favicon ||
                (currentSession.domain ? getFaviconUrl(currentSession.domain) : '')
              }
              alt=""
              className="w-7 h-7 object-contain p-1 bg-slate-800 rounded-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-slate-100 truncate">
                {currentSession.domain || 'No active website'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {currentSession.title || 'Focus or switch tabs to record'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-indigo-400">
                {formatDuration(currentSession.currentSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Total Summary */}
        <div className="flex items-center justify-between p-3 glass-panel">
          <span className="text-xs font-semibold text-slate-400">Today's Total Time</span>
          <span className="text-base font-extrabold text-slate-100">
            {formatDuration(todayTotalTime)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 glass-panel">
          <span className="text-xs font-semibold text-slate-400">Productivity Score</span>
          <span className="text-base font-extrabold text-emerald-400">{todayProductivityScore}</span>
        </div>

        {/* Top 5 Visited Today */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Top 5 Websites Today
          </h4>

          {top5Websites.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No activity recorded today.
            </div>
          ) : (
            <div className="space-y-1.5">
              {top5Websites.map((item) => {
                const percentage =
                  todayTotalTime > 0 ? (item.timeSpent / todayTotalTime) * 100 : 0;
                const categoryColor = CATEGORIES[item.category]?.color || '#6366f1';
                return (
                  <div
                    key={item.domain}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={item.favicon}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="font-semibold text-slate-200 truncate">{item.domain}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-12 bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, percentage)}%`,
                            backgroundColor: categoryColor,
                          }}
                        />
                      </div>
                      <span className="font-bold text-slate-300 w-12 text-right">
                        {formatDuration(item.timeSpent)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Open Dashboard Action */}
      <div className="pt-4 mt-4 border-t border-slate-800">
        <button
          onClick={handleOpenDashboard}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all duration-200"
        >
          <Globe className="w-4 h-4" /> Open Full Dashboard <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Popup: React.FC = () => {
  return (
    <ThemeProvider>
      <StorageProvider>
        <PopupContent />
      </StorageProvider>
    </ThemeProvider>
  );
};
