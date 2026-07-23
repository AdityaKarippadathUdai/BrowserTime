import React, { useMemo, useState } from 'react';
import { Filter, Search as SearchIcon, Tag } from 'lucide-react';
import { DomainCard } from '../../components/cards/DomainCard';
import { CATEGORIES } from '../../constants/categories';
import { useStorage } from '../../contexts/StorageContext';
import { CategoryName, DomainStats } from '../../types';
import { getDomainCategory } from '../../utils/categorization';
import { getFormattedDate } from '../../utils/formatters';
import { WebsiteDetailModal } from '../WebsiteDetail/WebsiteDetailModal';

type TimeFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

export const Search: React.FC = () => {
  const { domains, daily, settings } = useStorage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<DomainStats | null>(null);

  const filteredResults = useMemo(() => {
    const nowMs = Date.now();
    const todayStr = getFormattedDate();

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterdayObj);

    const sevenDaysAgo = nowMs - 7 * 86400 * 1000;
    const thirtyDaysAgo = nowMs - 30 * 86400 * 1000;

    // Calculate aggregated timeSpent for selected time filter per domain
    const timeSpentMap: { [dom: string]: number } = {};

    if (timeFilter === 'all') {
      Object.values(domains).forEach((ds) => {
        timeSpentMap[ds.domain] = ds.totalTime || 0;
      });
    } else {
      Object.entries(daily).forEach(([dateStr, record]) => {
        const dateMs = new Date(dateStr).getTime();
        let matchTime = false;

        if (timeFilter === 'today' && dateStr === todayStr) matchTime = true;
        else if (timeFilter === 'yesterday' && dateStr === yesterdayStr) matchTime = true;
        else if (timeFilter === 'week' && dateMs >= sevenDaysAgo) matchTime = true;
        else if (timeFilter === 'month' && dateMs >= thirtyDaysAgo) matchTime = true;

        if (matchTime && record.domains) {
          Object.entries(record.domains).forEach(([dom, sec]) => {
            timeSpentMap[dom] = (timeSpentMap[dom] || 0) + sec;
          });
        }
      });
    }

    let grandTotalTime = Object.values(timeSpentMap).reduce((a, b) => a + b, 0);

    const list = Object.keys(timeSpentMap).map((dom) => {
      const ds = domains[dom] || {
        domain: dom,
        title: dom,
        totalTime: timeSpentMap[dom],
        sessions: [],
        category: getDomainCategory(dom, settings),
        lastVisited: Date.now(),
      };
      return { ...ds, timeSpent: timeSpentMap[dom] };
    });

    // Apply search query & category filter
    const queryLower = searchQuery.toLowerCase().trim();

    const filtered = list.filter((item) => {
      const matchQuery =
        !queryLower ||
        item.domain.toLowerCase().includes(queryLower) ||
        (item.title && item.title.toLowerCase().includes(queryLower));

      const cat = getDomainCategory(item.domain, settings);
      const matchCat = categoryFilter === 'all' || cat === categoryFilter;

      return matchQuery && matchCat && item.timeSpent > 0;
    });

    filtered.sort((a, b) => b.timeSpent - a.timeSpent);

    return { list: filtered, grandTotalTime };
  }, [domains, daily, searchQuery, timeFilter, categoryFilter, settings]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-100">History & Search</h2>
        <p className="text-xs text-slate-400">Search and filter your website usage data</p>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="glass-panel p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain or website title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 shrink-0">Timeframe:</span>
            <div className="flex flex-wrap gap-1">
              {(['today', 'yesterday', 'week', 'month', 'all'] as TimeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    timeFilter === tf
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf === 'week' ? 'This Week' : tf === 'month' ? 'Last Month' : tf === 'all' ? 'All Time' : tf}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORIES).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {catKey}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Results ({filteredResults.list.length} websites)
        </span>
      </div>

      {/* Domain Cards List */}
      {filteredResults.list.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500 space-y-2">
          <p className="text-base font-semibold text-slate-400">No matching website history found.</p>
          <p className="text-xs">Try adjusting your search query or timeframe filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResults.list.map((item) => (
            <DomainCard
              key={item.domain}
              domain={item.domain}
              title={item.title}
              timeSpent={item.timeSpent}
              totalDailyTime={filteredResults.grandTotalTime}
              category={getDomainCategory(item.domain, settings)}
              favicon={item.favicon}
              onClick={() => setSelectedDomain(domains[item.domain] || item)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <WebsiteDetailModal
        isOpen={!!selectedDomain}
        onClose={() => setSelectedDomain(null)}
        domainStats={selectedDomain}
      />
    </div>
  );
};
