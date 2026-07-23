import { extractDomain } from '../utils/formatters';
import { updateTimeSpent } from './storage';

export class TimeTracker {
  private activeDomain: string | null = null;
  private activeTitle: string | null = null;
  private activeFavicon: string | null = null;
  private sessionStartTime: number | null = null;
  private isWindowFocused: boolean = true;
  private isUserActive: boolean = true;

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    // Tab Activated
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        this.switchTab(tab);
      } catch (e) {
        // Tab might have closed
      }
    });

    // Tab Updated (URL or Title change)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.active) {
        this.switchTab(tab);
      }
    });

    // Window Focus Changed
    if (chrome.windows) {
      chrome.windows.onFocusChanged.addListener((windowId) => {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
          this.setWindowFocused(false);
        } else {
          this.setWindowFocused(true);
          this.syncActiveTab();
        }
      });
    }
  }

  public async syncActiveTab(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab) {
        this.switchTab(activeTab);
      } else {
        this.pauseTracking();
      }
    } catch (e) {
      console.error('Error syncing active tab:', e);
    }
  }

  public setWindowFocused(focused: boolean): void {
    if (this.isWindowFocused === focused) return;
    this.isWindowFocused = focused;

    if (!focused) {
      this.pauseTracking();
    } else {
      this.syncActiveTab();
    }
  }

  public setUserActive(active: boolean): void {
    if (this.isUserActive === active) return;
    this.isUserActive = active;

    if (!active) {
      this.pauseTracking();
    } else {
      this.syncActiveTab();
    }
  }

  private switchTab(tab: chrome.tabs.Tab): void {
    const newDomain = extractDomain(tab.url);

    // If invalid domain (chrome://, about:blank, extension pages) -> pause tracking
    if (!newDomain) {
      this.pauseTracking();
      return;
    }

    const newTitle = tab.title || newDomain;
    const newFavicon = tab.favIconUrl || '';

    // If domain changed or we were paused -> flush previous session & start new
    if (newDomain !== this.activeDomain || !this.sessionStartTime) {
      this.flushTimeSpent();
      this.activeDomain = newDomain;
      this.activeTitle = newTitle;
      this.activeFavicon = newFavicon;
      this.sessionStartTime = Date.now();
    } else {
      // Same domain, update title/favicon metadata if changed
      this.activeTitle = newTitle;
      if (newFavicon) this.activeFavicon = newFavicon;
    }
  }

  public flushTimeSpent(): void {
    if (
      this.activeDomain &&
      this.sessionStartTime &&
      this.isWindowFocused &&
      this.isUserActive
    ) {
      const now = Date.now();
      const seconds = Math.floor((now - this.sessionStartTime) / 1000);
      if (seconds > 0) {
        const domain = this.activeDomain;
        const title = this.activeTitle || domain;
        const favicon = this.activeFavicon || undefined;
        const startTime = this.sessionStartTime;

        updateTimeSpent(domain, title, favicon, seconds, startTime);
        // Reset start time to now for ongoing tracking
        this.sessionStartTime = now;
      }
    }
  }

  public pauseTracking(): void {
    this.flushTimeSpent();
    this.activeDomain = null;
    this.activeTitle = null;
    this.activeFavicon = null;
    this.sessionStartTime = null;
  }

  public getCurrentSessionInfo() {
    let currentSeconds = 0;
    if (this.activeDomain && this.sessionStartTime && this.isWindowFocused && this.isUserActive) {
      currentSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }
    return {
      domain: this.activeDomain,
      title: this.activeTitle,
      favicon: this.activeFavicon,
      sessionStartTime: this.sessionStartTime,
      currentSeconds,
      isTracking: !!(this.activeDomain && this.isWindowFocused && this.isUserActive),
    };
  }
}
