import React from 'react';
import { Calendar, Clock, ExternalLink, ShieldAlert, Tag, Zap } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';
import { useStorage } from '../../contexts/StorageContext';
import { CategoryName, DomainStats, ProductivityType } from '../../types';
import { getDomainCategory, getDomainProductivityType, getWebsiteAnalytics } from '../../utils/categorization';
import { formatDuration, formatDurationDetailed, getFaviconUrl } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

interface WebsiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainStats: DomainStats | null;
}

export const WebsiteDetailModal: React.FC<WebsiteDetailModalProps> = ({
  isOpen,
  onClose,
  domainStats,
}) => {
  const { daily, settings, updateWebsiteCategory, updateWebsiteProductivity } = useStorage();

  if (!domainStats) return null;

  const analytics = getWebsiteAnalytics(domainStats, daily, settings);
  const currentCategory = getDomainCategory(domainStats.domain, settings);
  const currentProdType = getDomainProductivityType(domainStats.domain, settings);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={domainStats.domain}>
      <div className="space-y-6">
        {/* Header Header Info */}
        <div className="flex items-center justify-between p-4 glass-panel bg-slate-900/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={domainStats.favicon || getFaviconUrl(domainStats.domain)}
              alt={domainStats.domain}
              className="w-10 h-10 object-contain p-1.5 bg-slate-800 rounded-xl border border-slate-700"
            />
            <div className="min-w-0">
              <h4 className="text-base font-bold text-slate-100 truncate">{domainStats.domain}</h4>
              <p className="text-xs text-slate-400 truncate">{domainStats.title || domainStats.domain}</p>
            </div>
          </div>
          <a
            href={`https://${domainStats.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Categories and Productivity Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-4 space-y-2">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Website Category
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateWebsiteCategory(domainStats.domain, e.target.value as CategoryName)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {Object.keys(CATEGORIES).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {catKey}
                </option>
              ))}
            </select>
          </div>

          <div className="glass-panel p-4 space-y-2">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Productivity Flag
            </label>
            <select
              value={currentProdType}
              onChange={(e) =>
                updateWebsiteProductivity(domainStats.domain, e.target.value as ProductivityType)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="productive">Productive (+Score)</option>
              <option value="distracting">Distracting (-Score)</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        {/* Time Stats Cards */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass-panel p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Today</span>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {formatDuration(analytics.todayTime)}
            </div>
          </div>
          <div className="glass-panel p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Weekly</span>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {formatDuration(analytics.weeklyTime)}
            </div>
          </div>
          <div className="glass-panel p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly</span>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {formatDuration(analytics.monthlyTime)}
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="glass-panel p-4 space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Session Analytics
          </h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400">Average Session:</span>
                <span className="ml-1 font-semibold text-slate-200">
                  {formatDurationDetailed(analytics.avgSessionLength)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400">Longest Session:</span>
                <span className="ml-1 font-semibold text-slate-200">
                  {formatDurationDetailed(analytics.longestSessionLength)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400">Last Visited:</span>
                <span className="ml-1 font-semibold text-slate-200">
                  {new Date(analytics.lastVisited).toLocaleDateString()}{' '}
                  {new Date(analytics.lastVisited).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400">Total Visits:</span>
                <span className="ml-1 font-semibold text-slate-200">
                  {analytics.sessionCount} sessions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
