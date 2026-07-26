// Unified browser API compatibility wrapper for Chrome & Firefox
export const browserAPI: typeof chrome = (globalThis as any).browser ?? (globalThis as any).chrome;
