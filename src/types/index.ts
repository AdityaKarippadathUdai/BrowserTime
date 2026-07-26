export type ProductivityType = 'productive' | 'distracting' | 'neutral';

export type CategoryName =
  | 'Development'
  | 'Learning'
  | 'Docs'
  | 'Entertainment'
  | 'Social'
  | 'Messaging'
  | 'Other';

export interface CategoryInfo {
  name: CategoryName;
  color: string;
  badgeBg: string;
  badgeText: string;
  productivityType: ProductivityType;
  defaultDomains: string[];
}

export interface Session {
  id: string;
  domain: string;
  url?: string;
  title: string;
  favicon?: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  category: CategoryName;
}

export interface DomainStats {
  domain: string;
  title: string;
  favicon?: string;
  totalTime: number; // total time in seconds
  sessions: Session[];
  category: CategoryName;
  customProductivity?: ProductivityType;
  lastVisited: number;
}

export interface DailyDomainUsage {
  [domain: string]: number; // domain -> seconds spent on date
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  domains: DailyDomainUsage;
  productivityScore: number;
  totalTime: number; // total seconds on this date
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  customProductiveDomains: string[];
  customDistractingDomains: string[];
  customCategories: { [domain: string]: CategoryName };
  enableNotifications: boolean;
  notificationThresholdMinutes: number;
  idleTimeoutSeconds: number;
  enableNewTabDashboard: boolean;
}

export interface ActiveTrackerState {
  domain: string | null;
  title: string | null;
  favicon: string | null;
  startTime: number | null;
  accumulatedSeconds: number;
}

export interface StorageState {
  domains: { [domain: string]: DomainStats };
  daily: { [dateStr: string]: DailyRecord };
  settings: Settings;
  activeState?: ActiveTrackerState;
}

export interface WebsiteAnalytics {
  domain: string;
  title: string;
  favicon?: string;
  category: CategoryName;
  productivityType: ProductivityType;
  todayTime: number;
  weeklyTime: number;
  monthlyTime: number;
  totalTime: number;
  sessionCount: number;
  avgSessionLength: number;
  longestSessionLength: number;
  lastVisited: number;
}
