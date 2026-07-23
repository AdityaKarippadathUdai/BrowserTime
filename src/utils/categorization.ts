import { CATEGORIES } from '../constants/categories';
import { CategoryName, DomainStats, ProductivityType, Settings, WebsiteAnalytics } from '../types';

/**
 * Determine category for a given domain
 */
export function getDomainCategory(domain: string, settings?: Settings): CategoryName {
  if (settings?.customCategories && settings.customCategories[domain]) {
    return settings.customCategories[domain];
  }

  for (const catName of Object.keys(CATEGORIES) as CategoryName[]) {
    const category = CATEGORIES[catName];
    if (category.defaultDomains.some((d) => domain === d || domain.endsWith('.' + d))) {
      return catName;
    }
  }

  return 'Other';
}

/**
 * Determine productivity type for domain based on settings and category defaults
 */
export function getDomainProductivityType(domain: string, settings?: Settings): ProductivityType {
  // Check user explicit domain custom lists
  if (settings?.customProductiveDomains.includes(domain)) {
    return 'productive';
  }
  if (settings?.customDistractingDomains.includes(domain)) {
    return 'distracting';
  }

  const category = getDomainCategory(domain, settings);
  return CATEGORIES[category].productivityType;
}

/**
 * Calculate productivity score (0 to 100) based on total time spent across domains
 */
export function calculateProductivityScore(
  domainTimeMap: { [domain: string]: number },
  settings?: Settings
): number {
  let totalTime = 0;
  let weightedScoreSum = 0;

  const categoryWeights: Record<CategoryName, number> = {
    Development: 100,
    Docs: 90,
    Learning: 80,
    Messaging: 50,
    Social: 20,
    Entertainment: 10,
    Other: 50,
  };

  Object.entries(domainTimeMap).forEach(([domain, time]) => {
    if (time <= 0) return;
    totalTime += time;

    const prodType = getDomainProductivityType(domain, settings);
    const category = getDomainCategory(domain, settings);

    if (prodType === 'productive') {
      weightedScoreSum += time * (categoryWeights[category] || 90);
    } else if (prodType === 'distracting') {
      weightedScoreSum += time * (categoryWeights[category] || 10);
    } else {
      weightedScoreSum += time * 50; // neutral
    }
  });

  if (totalTime === 0) return 100; // Perfect score if no time spent

  const rawScore = weightedScoreSum / totalTime;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Extract website analytics for a single domain
 */
export function getWebsiteAnalytics(
  domainStats: DomainStats,
  dailyRecords: { [dateStr: string]: any },
  settings?: Settings
): WebsiteAnalytics {
  const domain = domainStats.domain;
  const sessions = domainStats.sessions || [];
  const category = getDomainCategory(domain, settings);
  const productivityType = getDomainProductivityType(domain, settings);

  let todayTime = 0;
  let weeklyTime = 0;
  let monthlyTime = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowMs = Date.now();
  const sevenDaysAgo = nowMs - 7 * 86400 * 1000;
  const thirtyDaysAgo = nowMs - 30 * 86400 * 1000;

  Object.entries(dailyRecords).forEach(([dateStr, record]) => {
    const timeOnDate = record?.domains?.[domain] || 0;
    if (dateStr === todayStr) {
      todayTime += timeOnDate;
    }

    const dateMs = new Date(dateStr).getTime();
    if (dateMs >= sevenDaysAgo) {
      weeklyTime += timeOnDate;
    }
    if (dateMs >= thirtyDaysAgo) {
      monthlyTime += timeOnDate;
    }
  });

  let longestSession = 0;
  let totalSessionDuration = 0;

  sessions.forEach((s) => {
    if (s.duration > longestSession) longestSession = s.duration;
    totalSessionDuration += s.duration;
  });

  const sessionCount = sessions.length;
  const avgSessionLength = sessionCount > 0 ? Math.round(totalSessionDuration / sessionCount) : 0;

  return {
    domain,
    title: domainStats.title || domain,
    favicon: domainStats.favicon,
    category,
    productivityType,
    todayTime,
    weeklyTime,
    monthlyTime,
    totalTime: domainStats.totalTime || 0,
    sessionCount,
    avgSessionLength,
    longestSessionLength: longestSession,
    lastVisited: domainStats.lastVisited || Date.now(),
  };
}
