import { DEFAULT_SETTINGS } from '../constants/categories';
import { DomainStats, Session, StorageState } from '../types';

const STORAGE_KEY = 'website_time_tracker_data';

export async function loadStorageData(): Promise<StorageState> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        const raw = res[STORAGE_KEY] || {};
        resolve({
          domains: raw.domains || {},
          daily: raw.daily || {},
          settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
          activeState: raw.activeState,
        });
      });
    } else {
      resolve({
        domains: {},
        daily: {},
        settings: DEFAULT_SETTINGS,
      });
    }
  });
}

export async function updateTimeSpent(
  domain: string,
  title: string,
  favicon: string | undefined,
  secondsSpent: number,
  sessionStart: number
): Promise<void> {
  if (!domain || secondsSpent <= 0) return;

  const data = await loadStorageData();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Update Domain Data
  const existingDomain: DomainStats = data.domains[domain] || {
    domain,
    title: title || domain,
    favicon: favicon || '',
    totalTime: 0,
    sessions: [],
    category: 'Other',
    lastVisited: Date.now(),
  };

  existingDomain.title = title || existingDomain.title || domain;
  if (favicon) existingDomain.favicon = favicon;
  existingDomain.totalTime += secondsSpent;
  existingDomain.lastVisited = Date.now();

  const newSession: Session = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    startTime: sessionStart,
    endTime: Date.now(),
    duration: secondsSpent,
  };

  // Limit session logs to last 100 per domain to optimize storage size
  existingDomain.sessions = [...(existingDomain.sessions || []).slice(-99), newSession];
  data.domains[domain] = existingDomain;

  // 2. Update Daily Data
  const dailyRecord = data.daily[dateStr] || {
    date: dateStr,
    domains: {},
    productivityScore: 100,
    totalTime: 0,
  };

  dailyRecord.domains[domain] = (dailyRecord.domains[domain] || 0) + secondsSpent;
  dailyRecord.totalTime = (dailyRecord.totalTime || 0) + secondsSpent;
  data.daily[dateStr] = dailyRecord;

  // 3. Save to chrome.storage.local
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => resolve());
    });
  }
}
