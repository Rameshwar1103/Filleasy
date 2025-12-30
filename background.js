/**
 * Background Service Worker - Handles session management and message routing
 * Manages encryption key storage in memory (temporary)
 */

// In-memory storage for encryption keys (cleared on service worker restart)
let encryptionKeyCache = null;
let sessionTimer = null;

/**
 * Initialize background service worker
 */
chrome.runtime.onInstalled.addListener(async () => {
  await initializeExtension();
});

/**
 * Handle messages from popup/content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep message channel open for async response
});

/**
 * Handle extension messages
 */
async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'storeEncryptionKey':
        // In a real implementation, we'd store this more securely
        // For this extension, we'll use a temporary cache
        encryptionKeyCache = request.key;
        startSessionTimer();
        sendResponse({ success: true });
        break;

      case 'clearEncryptionKey':
        encryptionKeyCache = null;
        clearSessionTimer();
        sendResponse({ success: true });
        break;

      case 'getEncryptionKey':
        sendResponse({ key: encryptionKeyCache });
        break;

      case 'checkSession':
        const isAuthenticated = await checkSession();
        sendResponse({ authenticated: isAuthenticated });
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Background error:', error);
    sendResponse({ error: error.message });
  }
}

/**
 * Initialize extension on install
 */
async function initializeExtension() {
  // Initialize storage with default settings
  // Note: In background script, we use chrome.storage directly
  const settings = await chrome.storage.local.get('settings');
  if (!settings.settings) {
    await chrome.storage.local.set({
      settings: {
        theme: 'light',
        autoFill: true,
        showPreview: true,
        sessionTimeout: 15,
        failedAttempts: 0,
        lockedUntil: null
      }
    });
  }
  
  console.log('Filleasy extension installed');
}

/**
 * Check if session is still valid
 */
async function checkSession() {
  const session = await chrome.storage.local.get('session');
  if (!session.session) return false;
  
  if (Date.now() > session.session.expiresAt) {
    await chrome.storage.local.remove('session');
    return false;
  }
  
  return true;
}

/**
 * Start session timer (auto-lock after 15 minutes)
 */
function startSessionTimer() {
  clearSessionTimer();
  
  sessionTimer = setTimeout(async () => {
    encryptionKeyCache = null;
    const StorageManager = (await import('./lib/storage-manager.js')).StorageManager;
    const AuthManager = (await import('./lib/auth-manager.js')).AuthManager;
    await AuthManager.clearSession();
    
    // Notify all tabs that session expired
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'sessionExpired' }).catch(() => {});
      });
    });
  }, 15 * 60 * 1000); // 15 minutes
}

/**
 * Clear session timer
 */
function clearSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

/**
 * Handle service worker activation
 */
chrome.runtime.onStartup.addListener(() => {
  // Clear encryption key cache on startup (security)
  encryptionKeyCache = null;
  clearSessionTimer();
});

