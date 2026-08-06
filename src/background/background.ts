import { browserAPI } from '../utils/browserApi';
import { FLUSH_ALARM, CHECK_NOTIF_ALARM, setupAlarms } from './alarms';
import { setupIdleListener } from './idle';
import { loadStorageData } from './storage';
import {
  getCurrentSessionInfo,
  initListeners,
  onIdleChange,
  periodicFlush,
  restoreTrackingSession,
  syncActiveTab,
} from './tracker';

let initialized = false;

function initializeTracking(): void {
  if (initialized) {
    return;
  }

  initialized = true;
  setupAlarms();
  initListeners();
  setupIdleListener(60, onIdleChange);
  void syncActiveTab();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

initializeTracking();

browserAPI.runtime.onInstalled.addListener(() => {
  initializeTracking();
  void restoreTrackingSession();
});

browserAPI.runtime.onStartup.addListener(() => {
  initializeTracking();
  void restoreTrackingSession();
});

if (browserAPI.runtime?.onSuspend) {
  browserAPI.runtime.onSuspend.addListener(() => {
    void periodicFlush();
  });
}

// ─── Alarm handler ────────────────────────────────────────────────────────────

browserAPI.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === FLUSH_ALARM) {
    await periodicFlush();
  } else if (alarm.name === CHECK_NOTIF_ALARM) {
    await checkNotificationThresholds();
  }
});

// ─── Message handler ──────────────────────────────────────────────────────────

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_SESSION') {
    (async () => {
      const info = await getCurrentSessionInfo();
      sendResponse(info);
    })();
    return true;
  }

  if (message.type === 'FORCE_FLUSH') {
    (async () => {
      await periodicFlush();
      sendResponse({ status: 'ok' });
    })();
    return true;
  }

  if (message.type === 'OPEN_DASHBOARD') {
    browserAPI.tabs.create({ url: browserAPI.runtime.getURL('dashboard.html') });
    sendResponse({ status: 'ok' });
    return true;
  }

  if (message.type === 'VISIBILITY_CHANGE') {
    (async () => {
      if (!message.hidden && sender.tab?.active) {
        await syncActiveTab();
      }
      sendResponse({ status: 'ok' });
    })();
    return true;
  }

  return false;
});

// ─── Notification check ───────────────────────────────────────────────────────

async function checkNotificationThresholds(): Promise<void> {
  const data = await loadStorageData();
  if (!data.settings.enableNotifications) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data.daily[todayStr];
  if (!todayData?.domains) return;

  const limitSeconds = data.settings.notificationThresholdMinutes * 60;
  if (limitSeconds <= 0) return;

  for (const [domain, seconds] of Object.entries(todayData.domains)) {
    if (seconds >= limitSeconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      browserAPI.notifications?.create(`limit_${domain}_${todayStr}`, {
        type: 'basic',
        iconUrl: browserAPI.runtime.getURL('icons/icon48.png'),
        title: 'Website Usage Limit',
        message: `You've spent ${timeStr} on ${domain} today.`,
        priority: 1,
      });
    }
  }
}
