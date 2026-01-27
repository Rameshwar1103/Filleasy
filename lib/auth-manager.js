/**
 * Authentication Manager - Handles user authentication and session management
 * Implements master password protection with attempt limiting
 */

// Note: CryptoUtils and StorageManager must be loaded before this script

class AuthManager {
  static MAX_ATTEMPTS = 10;
  static LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
  static SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * Check if user is authenticated (has valid session)
   * @returns {Promise<boolean>}
   */
  static async isAuthenticated() {
    const session = await StorageManager.get('session');
    if (!session) return false;

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      await this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Create new session
   * @param {CryptoKey} encryptionKey - Encryption key derived from master password
   * @returns {Promise<void>}
   */
  static async createSession(encryptionKey) {
    const token = CryptoUtils.generateSessionToken();
    const expiresAt = Date.now() + this.SESSION_DURATION;

    // Store session token and expiration
    await StorageManager.save('session', {
      token: token,
      expiresAt: expiresAt,
      createdAt: Date.now()
    });

    // Store encryption key temporarily in memory (will be cleared on session expiry)
    // In a real extension, we'd use a different mechanism, but for this implementation
    // we'll store a reference that the background script can use
    await chrome.runtime.sendMessage({
      action: 'storeEncryptionKey',
      key: encryptionKey
    }).catch(() => {}); // Ignore errors if background script not ready
  }

  /**
   * Clear session (logout)
   * @returns {Promise<void>}
   */
  static async clearSession() {
    await StorageManager.remove('session');
    await chrome.runtime.sendMessage({
      action: 'clearEncryptionKey'
    }).catch(() => {});
  }

  /**
   * Check if account is locked
   * @returns {Promise<boolean>}
   */
  static async isLocked() {
    const settings = await StorageManager.get('settings');
    if (!settings?.lockedUntil) return false;

    if (Date.now() < settings.lockedUntil) {
      return true;
    }

    // Lock expired, clear it
    settings.lockedUntil = null;
    settings.failedAttempts = 0;
    await StorageManager.save('settings', settings);
    return false;
  }

  /**
   * Record failed login attempt
   * @returns {Promise<void>}
   */
  static async recordFailedAttempt() {
    const settings = await StorageManager.get('settings') || {};
    settings.failedAttempts = (settings.failedAttempts || 0) + 1;

    if (settings.failedAttempts >= this.MAX_ATTEMPTS) {
      settings.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
      settings.failedAttempts = 0; // Reset counter after lockout
    }

    await StorageManager.save('settings', settings);
  }

  /**
   * Clear failed attempts (on successful login)
   * @returns {Promise<void>}
   */
  static async clearFailedAttempts() {
    const settings = await StorageManager.get('settings') || {};
    settings.failedAttempts = 0;
    settings.lockedUntil = null;
    await StorageManager.save('settings', settings);
  }

  /**
   * Get remaining lockout time in minutes
   * @returns {Promise<number>} - Minutes remaining (0 if not locked)
   */
  static async getLockoutRemaining() {
    const settings = await StorageManager.get('settings');
    if (!settings?.lockedUntil) return 0;

    const remaining = settings.lockedUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 60000));
  }

  /**
   * Get remaining attempts
   * @returns {Promise<number>}
   */
  static async getRemainingAttempts() {
    const settings = await StorageManager.get('settings');
    return Math.max(0, this.MAX_ATTEMPTS - (settings?.failedAttempts || 0));
  }

  /**
   * Set master password (first time setup)
   * @param {string} password - Master password
   * @param {CryptoKey} encryptionKey - Derived encryption key
   * @returns {Promise<void>}
   */
  static async setMasterPassword(password, encryptionKey) {
    const { hash, salt } = await CryptoUtils.hashPassword(password);
    await StorageManager.save('masterPasswordHash', hash);
    await StorageManager.save('masterPasswordSalt', salt);
    await this.createSession(encryptionKey);
  }

  /**
   * Verify master password and create session
   * @param {string} password - Password to verify
   * @returns {Promise<{success: boolean, encryptionKey: CryptoKey|null}>}
   */
  static async verifyMasterPassword(password) {
    // Check if locked
    if (await this.isLocked()) {
      const remaining = await this.getLockoutRemaining();
      throw new Error(`Account locked. Try again in ${remaining} minutes.`);
    }

    const storedHash = await StorageManager.get('masterPasswordHash');
    const storedSalt = await StorageManager.get('masterPasswordSalt');

    if (!storedHash || !storedSalt) {
      throw new Error('Master password not set. Please set up your account first.');
    }

    const isValid = await CryptoUtils.verifyPassword(password, storedHash, storedSalt);

    if (!isValid) {
      await this.recordFailedAttempt();
      const remaining = await this.getRemainingAttempts();
      throw new Error(`Incorrect password. ${remaining} attempt(s) remaining.`);
    }

    // Password correct - clear failed attempts and create session
    await this.clearFailedAttempts();
    
    // Derive encryption key from password
    const saltArray = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
    const encryptionKey = await CryptoUtils.deriveKey(password, saltArray);
    
    await this.createSession(encryptionKey);
    
    return { success: true, encryptionKey };
  }

  /**
   * Check if master password is set
   * @returns {Promise<boolean>}
   */
  static async isMasterPasswordSet() {
    const hash = await StorageManager.get('masterPasswordHash');
    return !!hash;
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - {strong: boolean, score: number, feedback: string[]}
   */
  static validatePasswordStrength(password) {
    const feedback = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Add numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Add special characters (!@#$%^&*)');
    } else {
      score += 1;
    }

    if (password.length >= 12) {
      score += 1;
    }

    return {
      strong: score >= 4,
      score: score,
      feedback: feedback,
      strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    };
  }
}

