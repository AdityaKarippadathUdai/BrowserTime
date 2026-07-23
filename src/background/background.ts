import { FLUSH_ALARM, CHECK_NOTIF_ALARM, setupAlarms } from './alarms';
import { setupIdleListener } from './idle';
import { loadStorageData } from './storage';
import { TimeTracker } from './tracker';

const tracker = new TimeTracker();

// Initialize periodic alarms
setupAlarms();

// Setup idle detection (default 60s)
setupIdleListener(60, (idleState) => {
  if (idleState === 'active') {
    tracker.setUserActive(true);
  } else {
    tracker.setUserActive(false);
  }
});

// Alarm Listener
if (typeof chrome !== 'undefined' && chrome.alarms) {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === FLUSH_ALARM) {
      tracker.flushTimeSpent();
    } else if (alarm.name === CHECK_NOTIF_ALARM) {
      checkNotificationThresholds();
    }
  });
}

// Runtime Messages (from Popup / Dashboard)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_SESSION') {
      sendResponse(tracker.getCurrentSessionInfo());
      return true;
    }

    if (message.type === 'FORCE_FLUSH') {
      tracker.flushTimeSpent();
      sendResponse({ status: 'ok' });
      return true;
    }

    if (message.type === 'OPEN_DASHBOARD') {
      const dashboardUrl = chrome.runtime.getURL('dashboard.html');
      chrome.tabs.create({ url: dashboardUrl });
      sendResponse({ status: 'ok' });
      return true;
    }
  });
}

// Notification Check
async function checkNotificationThresholds(): Promise<void> {
  const data = await loadStorageData();
  const settings = data.settings;

  if (!settings.enableNotifications) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = data.daily[todayStr];
  if (!todayData || !todayData.domains) return;

  const limitSeconds = settings.notificationThresholdMinutes * 60;
  if (limitSeconds <= 0) return;

  // Check each domain for time limits
  Object.entries(todayData.domains).forEach(([domain, seconds]) => {
    if (seconds >= limitSeconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create(`limit_${domain}_${todayStr}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon48.png'),
          title: 'Website Usage Limit Reached',
          message: `You have spent ${timeStr} on ${domain} today.`,
          priority: 1,
        });
      }
    }
  });
}

// Initial Sync
tracker.syncActiveTab();

console.log('⚡ Website Time Tracker Service Worker initialized.');
