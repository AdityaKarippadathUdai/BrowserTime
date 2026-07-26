import { browserAPI } from '../utils/browserApi';

// Content script for detecting document visibility changes & activity
function notifyVisibility() {
  if (browserAPI && browserAPI.runtime) {
    try {
      browserAPI.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        hidden: document.hidden,
        domain: window.location.hostname,
      });
    } catch (e) {
      // Extension context invalidated when extension reloads/updates
    }
  }
}

document.addEventListener('visibilitychange', notifyVisibility);
window.addEventListener('focus', notifyVisibility);

// Initial ping when content script loads on active tab
if (!document.hidden) {
  notifyVisibility();
}
