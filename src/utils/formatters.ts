/**
 * Format total seconds into human readable duration
 * Example: 8280 -> "2h 18m", 3300 -> "55m", 45 -> "45s"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${secs}s`;
}

/**
 * Format total seconds into a detailed string (e.g. 2 hours 18 minutes)
 */
export function formatDurationDetailed(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 minutes';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  const hrsPart = hrs > 0 ? `${hrs} ${hrs === 1 ? 'hour' : 'hours'}` : '';
  const minsPart = mins > 0 ? `${mins} ${mins === 1 ? 'minute' : 'minutes'}` : '';

  if (hrsPart && minsPart) return `${hrsPart} ${minsPart}`;
  if (hrsPart) return hrsPart;
  if (minsPart) return minsPart;
  return `${Math.floor(seconds)} seconds`;
}

/**
 * Extract clean domain name from full URL
 */
export function extractDomain(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  } catch {
    return null;
  }
}

/**
 * Format percentage value
 */
export function formatPercentage(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  return `${Math.round(val)}%`;
}

/**
 * Get date string format YYYY-MM-DD
 */
export function getFormattedDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get favicon URL for domain
 */
export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
