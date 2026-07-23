import { CategoryInfo, CategoryName, Settings } from '../types';

export const CATEGORIES: Record<CategoryName, CategoryInfo> = {
  Development: {
    name: 'Development',
    color: '#3b82f6', // blue
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
    productivityType: 'productive',
    defaultDomains: [
      'github.com',
      'gitlab.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'leetcode.com',
      'codeforces.com',
      'geeksforgeeks.org',
      'npmjs.com',
      'dev.to',
      'codepen.io',
      'replit.com',
      'chatgpt.com',
      'claude.ai',
      'anthropic.com',
      'vercel.com',
      'netlify.com',
    ],
  },
  Learning: {
    name: 'Learning',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    productivityType: 'productive',
    defaultDomains: [
      'coursera.org',
      'udemy.com',
      'edx.org',
      'wikipedia.org',
      'khanacademy.org',
      'medium.com',
      'duolingo.com',
      'datacamp.com',
      'freecodecamp.org',
    ],
  },
  Docs: {
    name: 'Docs',
    color: '#8b5cf6', // purple
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-600 dark:text-purple-400',
    productivityType: 'productive',
    defaultDomains: [
      'docs.google.com',
      'notion.so',
      'readthedocs.io',
      'confluence.atlassian.com',
      'overleaf.com',
      'coda.io',
      'figma.com',
    ],
  },
  Social: {
    name: 'Social',
    color: '#f59e0b', // amber
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    productivityType: 'distracting',
    defaultDomains: [
      'instagram.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'reddit.com',
      'linkedin.com',
      'tiktok.com',
      'pinterest.com',
    ],
  },
  Entertainment: {
    name: 'Entertainment',
    color: '#ef4444', // red
    badgeBg: 'bg-red-500/10 dark:bg-red-500/20',
    badgeText: 'text-red-600 dark:text-red-400',
    productivityType: 'distracting',
    defaultDomains: [
      'netflix.com',
      'youtube.com',
      'primevideo.com',
      'disneyplus.com',
      'twitch.tv',
      'hulu.com',
      'spotify.com',
      'steampowered.com',
    ],
  },
  Messaging: {
    name: 'Messaging',
    color: '#06b6d4', // cyan
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
    productivityType: 'neutral',
    defaultDomains: [
      'whatsapp.com',
      'web.whatsapp.com',
      'discord.com',
      'slack.com',
      'teams.microsoft.com',
      'telegram.org',
      'web.telegram.org',
    ],
  },
  Other: {
    name: 'Other',
    color: '#6b7280', // gray
    badgeBg: 'bg-gray-500/10 dark:bg-gray-500/20',
    badgeText: 'text-gray-600 dark:text-gray-400',
    productivityType: 'neutral',
    defaultDomains: [],
  },
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  customProductiveDomains: [],
  customDistractingDomains: [],
  customCategories: {},
  enableNotifications: true,
  notificationThresholdMinutes: 120,
  idleTimeoutSeconds: 60,
  enableNewTabDashboard: true,
};
