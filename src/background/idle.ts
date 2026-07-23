export type IdleState = 'active' | 'idle' | 'locked';

export function setupIdleListener(
  detectionIntervalSeconds: number,
  onStateChange: (state: IdleState) => void
): void {
  if (typeof chrome !== 'undefined' && chrome.idle) {
    try {
      chrome.idle.setDetectionInterval(detectionIntervalSeconds);
      chrome.idle.onStateChanged.addListener((newState) => {
        onStateChange(newState as IdleState);
      });
    } catch (e) {
      console.error('Idle detection setup error:', e);
    }
  }
}
