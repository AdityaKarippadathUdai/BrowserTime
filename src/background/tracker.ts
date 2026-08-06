/**
 * Tracker — persists active browsing state across service-worker restarts.
 *
 * The extension uses browser storage as the single source of truth for active
 * tracking state, while the in-memory flags only reflect transient browser UI
 * conditions such as focus and idle state.
 */
import { browserAPI } from '../utils/browserApi';
import { extractDomain } from '../utils/formatters';
import { ActiveState, commitSeconds, loadActiveState, saveActiveState } from './storage';

let isWindowFocused = true;
let isUserIdle = false;
let initializedFromStorage = false;

function buildSessionState(domain: string, title: string, favicon: string, url: string, tab?: chrome.tabs.Tab | null): ActiveState {
  const now = Date.now();
  return {
    domain,
    url,
    title,
    favicon,
    startTime: now,
    lastUpdated: now,
    sessionId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    tabId: tab?.id,
    windowId: tab?.windowId,
  };
}

function isSupportedUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function queryActiveTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    try {
      browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (browserAPI.runtime.lastError) {
          resolve(null);
          return;
        }

        if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
          return;
        }

        browserAPI.tabs.query({ active: true, lastFocusedWindow: true }, (fallbackTabs) => {
          resolve(fallbackTabs && fallbackTabs.length > 0 ? fallbackTabs[0] : null);
        });
      });
    } catch {
      resolve(null);
    }
  });
}

async function finalizeSession(finalizeAt: number = Date.now()): Promise<void> {
  const active = await loadActiveState();
  if (!active) return;

  const safeFinalizeAt = Math.max(active.startTime, Math.min(finalizeAt, Date.now()));
  const seconds = Math.max(0, Math.floor((safeFinalizeAt - active.startTime) / 1000));

  if (seconds > 0) {
    await commitSeconds(active.domain, active.url, active.title, active.favicon, seconds, active.startTime);
  }

  await saveActiveState(null);
}

async function startTracking(domain: string, title: string, favicon: string, url: string, tab?: chrome.tabs.Tab | null): Promise<void> {
  const current = await loadActiveState();
  const now = Date.now();

  if (current) {
    const seconds = Math.max(0, Math.floor((now - current.startTime) / 1000));
    if (seconds > 0) {
      await commitSeconds(current.domain, current.url, current.title, current.favicon, seconds, current.startTime);
    }
    await saveActiveState(null);
  }

  await saveActiveState(buildSessionState(domain, title, favicon, url, tab));
}

async function stopTracking(finalizeAt: number = Date.now()): Promise<void> {
  await finalizeSession(finalizeAt);
}

async function processTab(tab: chrome.tabs.Tab | null): Promise<void> {
  if (isUserIdle || !isWindowFocused) {
    await stopTracking();
    return;
  }

  if (!tab) {
    await stopTracking();
    return;
  }

  const url = tab.url || tab.pendingUrl || '';
  if (!isSupportedUrl(url)) {
    await stopTracking();
    return;
  }

  const domain = extractDomain(url);
  if (!domain) {
    await stopTracking();
    return;
  }

  const title = tab.title || domain;
  const favicon = tab.favIconUrl || '';
  const active = await loadActiveState();

  if (!active || active.domain !== domain) {
    await startTracking(domain, title, favicon, url, tab);
  } else {
    const nextTitle = title || active.title;
    const nextFavicon = favicon || active.favicon;
    const now = Date.now();
    const nextState: ActiveState = {
      ...active,
      url,
      title: nextTitle,
      favicon: nextFavicon,
      lastUpdated: now,
      tabId: tab?.id,
      windowId: tab?.windowId,
    };

    if (nextTitle !== active.title || nextFavicon !== active.favicon || url !== active.url || tab?.id !== active.tabId || tab?.windowId !== active.windowId) {
      await saveActiveState(nextState);
    } else {
      await saveActiveState({ ...active, lastUpdated: now, tabId: tab?.id, windowId: tab?.windowId });
    }
  }
}

export async function syncActiveTab(): Promise<void> {
  const active = await loadActiveState();
  const tab = await queryActiveTab();

  if (!active && !tab) {
    return;
  }

  if (!initializedFromStorage) {
    initializedFromStorage = true;
    if (active) {
      await processTab(tab);
      return;
    }
  }

  await processTab(tab);
}

export async function restoreTrackingSession(): Promise<void> {
  const active = await loadActiveState();
  if (!active) {
    return;
  }

  const finalizeAt = active.lastUpdated ?? active.startTime ?? Date.now();
  await finalizeSession(finalizeAt);
  await syncActiveTab();
}

export async function periodicFlush(): Promise<void> {
  if (isUserIdle || !isWindowFocused) {
    await stopTracking();
    return;
  }

  const active = await loadActiveState();
  if (!active) return;

  await saveActiveState({ ...active, lastUpdated: Date.now() });
}

export async function onWindowFocusChange(focused: boolean): Promise<void> {
  isWindowFocused = focused;
  if (!focused) {
    await stopTracking();
  } else {
    await syncActiveTab();
  }
}

export async function onIdleChange(state: string): Promise<void> {
  isUserIdle = state !== 'active';
  if (isUserIdle) {
    await stopTracking();
  } else {
    await syncActiveTab();
  }
}

export async function getCurrentSessionInfo(): Promise<{
  domain: string | null;
  title: string | null;
  favicon: string | null;
  currentSeconds: number;
  isTracking: boolean;
}> {
  const active = await loadActiveState();

  if (!active || isUserIdle || !isWindowFocused) {
    return { domain: null, title: null, favicon: null, currentSeconds: 0, isTracking: false };
  }

  const currentSeconds = Math.floor((Date.now() - active.startTime) / 1000);
  return {
    domain: active.domain,
    title: active.title,
    favicon: active.favicon,
    currentSeconds,
    isTracking: true,
  };
}

export function initListeners(): void {
  browserAPI.tabs.onActivated.addListener((info) => {
    browserAPI.tabs.get(info.tabId, (tab) => {
      if (!browserAPI.runtime.lastError && tab) {
        void processTab(tab);
      }
    });
  });

  browserAPI.tabs.onUpdated.addListener((_id, change, tab) => {
    if (tab?.active && (change.url || change.title || change.status === 'complete')) {
      void processTab(tab);
    }
  });

  browserAPI.tabs.onRemoved.addListener((_tabId, removeInfo) => {
    if (removeInfo.isWindowClosing) {
      void stopTracking();
    } else {
      void syncActiveTab();
    }
  });

  if (browserAPI.windows) {
    browserAPI.windows.onFocusChanged.addListener(async (windowId) => {
      const focused = windowId !== browserAPI.windows.WINDOW_ID_NONE;
      await onWindowFocusChange(focused);
    });

    browserAPI.windows.onRemoved.addListener(async (_windowId) => {
      await stopTracking();
    });
  }
}
