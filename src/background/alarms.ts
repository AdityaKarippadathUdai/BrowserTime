import { browserAPI } from '../utils/browserApi';

export const FLUSH_ALARM = 'wtt_flush';
export const CHECK_NOTIF_ALARM = 'wtt_check_notif';

export function setupAlarms(): void {
  if (!browserAPI?.alarms) return;

  // Flush active seconds every ~10 seconds
  browserAPI.alarms.get(FLUSH_ALARM, (existing) => {
    if (!existing) {
      browserAPI.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 / 6 }); // ~10s
    }
  });

  // Notification check every 5 minutes
  browserAPI.alarms.get(CHECK_NOTIF_ALARM, (existing) => {
    if (!existing) {
      browserAPI.alarms.create(CHECK_NOTIF_ALARM, { periodInMinutes: 5 });
    }
  });
}
