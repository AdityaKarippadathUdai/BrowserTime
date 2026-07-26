import { DEFAULT_SETTINGS } from '../constants/categories';
import { StorageState } from '../types';
import { browserAPI } from './browserApi';

const STORAGE_KEY = 'website_time_tracker_data';

const initial: StorageState = { domains: {}, daily: {}, settings: DEFAULT_SETTINGS };

function readRaw(): Promise<StorageState> {
  return new Promise((resolve) => {
    if (browserAPI?.storage?.local) {
      browserAPI.storage.local.get(STORAGE_KEY, (res) => {
        const raw = res?.[STORAGE_KEY] || {};
        resolve({
          domains: raw.domains || {},
          daily: raw.daily || {},
          settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
          activeState: raw.activeState,
        });
      });
    } else {
      // Dev fallback
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          const p = JSON.parse(item);
          resolve({ ...initial, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings || {}) } });
          return;
        }
      } catch { /* ignore */ }
      resolve({ ...initial });
    }
  });
}

export async function getStorageData(): Promise<StorageState> {
  return readRaw();
}

export async function saveStorageData(state: Partial<StorageState>): Promise<void> {
  const current = await readRaw();
  const next: StorageState = {
    ...current,
    ...state,
    settings: { ...current.settings, ...(state.settings || {}) },
  };

  if (browserAPI?.storage?.local) {
    await new Promise<void>((resolve) => {
      browserAPI.storage.local.set({ [STORAGE_KEY]: next }, resolve);
    });
  } else {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
}

export async function resetAllData(): Promise<void> {
  await saveStorageData({ domains: {}, daily: {}, settings: DEFAULT_SETTINGS });
  // Also clear active tracking state
  if (browserAPI?.storage?.local) {
    await new Promise<void>((resolve) => {
      browserAPI.storage.local.remove('wtt_active_state', resolve);
    });
  }
}

export async function exportDataJSON(): Promise<string> {
  return JSON.stringify(await readRaw(), null, 2);
}

export async function importDataJSON(jsonStr: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;
    const current = await readRaw();
    await saveStorageData({
      domains: { ...current.domains, ...(parsed.domains || {}) },
      daily: { ...current.daily, ...(parsed.daily || {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    });
    return true;
  } catch { return false; }
}
