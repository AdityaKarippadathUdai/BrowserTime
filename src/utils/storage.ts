import { DEFAULT_SETTINGS } from '../constants/categories';
import { StorageState } from '../types';

const STORAGE_KEY = 'website_time_tracker_data';

const initialStorageState: StorageState = {
  domains: {},
  daily: {},
  settings: DEFAULT_SETTINGS,
};

export async function getStorageData(): Promise<StorageState> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          resolve({
            ...initialStorageState,
            ...result[STORAGE_KEY],
            settings: {
              ...DEFAULT_SETTINGS,
              ...(result[STORAGE_KEY].settings || {}),
            },
          });
        } else {
          resolve(initialStorageState);
        }
      });
    });
  } else {
    // LocalStorage fallback for dev mode
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return {
          ...initialStorageState,
          ...parsed,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to parse localStorage:', e);
    }
    return initialStorageState;
  }
}

export async function saveStorageData(state: Partial<StorageState>): Promise<void> {
  const current = await getStorageData();
  const updatedState: StorageState = {
    ...current,
    ...state,
    settings: {
      ...current.settings,
      ...(state.settings || {}),
    },
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updatedState }, () => {
        resolve();
      });
    });
  } else {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }
}

export async function resetAllData(): Promise<void> {
  const resetState: StorageState = {
    domains: {},
    daily: {},
    settings: DEFAULT_SETTINGS,
  };
  await saveStorageData(resetState);
}

export async function exportDataJSON(): Promise<string> {
  const data = await getStorageData();
  return JSON.stringify(data, null, 2);
}

export async function importDataJSON(jsonStr: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;

    const current = await getStorageData();
    const merged: StorageState = {
      domains: { ...(current.domains || {}), ...(parsed.domains || {}) },
      daily: { ...(current.daily || {}), ...(parsed.daily || {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };

    await saveStorageData(merged);
    return true;
  } catch (e) {
    console.error('Invalid JSON import:', e);
    return false;
  }
}
