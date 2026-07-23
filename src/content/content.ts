// Content script for detecting document visibility changes
document.addEventListener('visibilitychange', () => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    try {
      chrome.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        hidden: document.hidden,
        domain: window.location.hostname,
      });
    } catch (e) {
      // Ignore extension context invalidated errors
    }
  }
});
