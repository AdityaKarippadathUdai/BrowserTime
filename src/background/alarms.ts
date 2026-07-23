export const FLUSH_ALARM = 'flush_active_time';
export const CHECK_NOTIF_ALARM = 'check_distraction_limit';

export function setupAlarms(): void {
  if (typeof chrome !== 'undefined' && chrome.alarms) {
    try {
      // Periodic flush every 10 seconds to save state safely
      chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 0.16 }); // ~10 seconds
      // Check notification thresholds every 5 minutes
      chrome.alarms.create(CHECK_NOTIF_ALARM, { periodInMinutes: 5 });
    } catch (e) {
      console.error('Alarms setup error:', e);
    }
  }
}
