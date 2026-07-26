import { DEFAULT_SETTINGS } from '../constants/categories';
import { CategoryName, DomainStats, Session, StorageState } from '../types';
import { browserAPI } from '../utils/browserApi';
import { getDomainCategory } from '../utils/categorization';

export const STORAGE_KEY = 'website_time_tracker_data';

// ─── Read ─────────────────────────────────────────────────────────────────────

export function loadStorageData(): Promise<StorageState> {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(STORAGE_KEY, (res) => {
      const raw = res?.[STORAGE_KEY] || {};
      resolve({
        domains: raw.domains || {},
        daily: raw.daily || {},
        settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
        activeState: raw.activeState,
      });
    });
  });
}

// ─── Write ─────────────────────────────────────────────────────────────────────

function saveRaw(data: StorageState): Promise<void> {
  return new Promise((resolve) => {
    browserAPI.storage.local.set({ [STORAGE_KEY]: data }, resolve);
  });
}

// ─── Active Tracking State (persisted across service worker restarts) ─────────

export interface ActiveState {
  domain: string;
  url: string;
  title: string;
  favicon: string;
  startTime: number; // ms timestamp when this segment started
  category?: CategoryName;
}

const ACTIVE_KEY = 'wtt_active_state';

export function saveActiveState(state: ActiveState | null): Promise<void> {
  return new Promise((resolve) => {
    if (state === null) {
      browserAPI.storage.local.remove(ACTIVE_KEY, resolve);
    } else {
      browserAPI.storage.local.set({ [ACTIVE_KEY]: state }, resolve);
    }
  });
}

export function loadActiveState(): Promise<ActiveState | null> {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(ACTIVE_KEY, (res) => {
      resolve(res?.[ACTIVE_KEY] ?? null);
    });
  });
}

// ─── Commit seconds to domain/daily records ───────────────────────────────────

export async function commitSeconds(
  domain: string,
  url: string,
  title: string,
  favicon: string,
  seconds: number,
  segmentStart: number
): Promise<void> {
  if (!domain || seconds <= 0) return;

  const data = await loadStorageData();
  const dateStr = new Date(segmentStart).toISOString().split('T')[0];

  // --- Domain aggregate ---
  const category = getDomainCategory(domain, data.settings);

  const existing: DomainStats = data.domains[domain] ?? {
    domain,
    title,
    favicon,
    totalTime: 0,
    sessions: [],
    category,
    lastVisited: Date.now(),
  };

  if (title) existing.title = title;
  if (favicon) existing.favicon = favicon;
  existing.totalTime += seconds;
  existing.lastVisited = Date.now();
  if (!existing.category || existing.category === 'Other') {
    existing.category = getDomainCategory(domain, data.settings);
  }

  const session: Session = {
    id: `${segmentStart}-${Math.random().toString(36).substring(2, 7)}`,
    domain,
    url,
    title,
    favicon,
    startTime: segmentStart,
    endTime: segmentStart + seconds * 1000,
    duration: seconds,
    category,
  };
  existing.sessions = [...(existing.sessions ?? []).slice(-99), session];
  data.domains[domain] = existing;

  // --- Daily record ---
  const day = data.daily[dateStr] ?? { date: dateStr, domains: {}, productivityScore: 100, totalTime: 0 };
  day.domains[domain] = (day.domains[domain] ?? 0) + seconds;
  day.totalTime = (day.totalTime ?? 0) + seconds;
  data.daily[dateStr] = day;

  await saveRaw(data);
}
