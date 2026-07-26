import { browserAPI } from '../utils/browserApi';

export type IdleState = 'active' | 'idle' | 'locked';

export function setupIdleListener(
  detectionIntervalSeconds: number,
  callback: (state: IdleState) => void
): void {
  if (!browserAPI?.idle) return;

  try {
    browserAPI.idle.setDetectionInterval(detectionIntervalSeconds);
    browserAPI.idle.onStateChanged.addListener((newState) => {
      callback(newState as IdleState);
    });
    // Fire initial state on SW startup
    browserAPI.idle.queryState(detectionIntervalSeconds, (state) => {
      if (state) callback(state as IdleState);
    });
  } catch (e) {
    console.error('Idle setup error:', e);
  }
}
