/**
 * Storage Manager - Handles encrypted data storage and retrieval
 * All sensitive data is encrypted before storage
 */

// Note: CryptoUtils must be loaded before this script

class StorageManager {
  /**
   * Save encrypted data to Chrome storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be encrypted)
   * @param {CryptoKey} encryptionKey - Encryption key
   * @returns {Promise<void>}
   */
  static async saveEncrypted(key, data, encryptionKey) {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = await CryptoUtils.encrypt(jsonData, encryptionKey);
      await chrome.storage.local.set({ [key]: encrypted });
    } catch (error) {
      console.error('Error saving encrypted data:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data from Chrome storage
   * @param {string} key - Storage key
   * @param {CryptoKey} decryptionKey - Decryption key
   * @returns {Promise<any>} - Decrypted data
   */
  static async getEncrypted(key, decryptionKey) {
    try {
      const result = await chrome.storage.local.get([key]);
      if (!result[key]) return null;

      const decrypted = await CryptoUtils.decrypt(result[key], decryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  }

  /**
   * Save unencrypted data to Chrome storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @returns {Promise<void>}
   */
  static async save(key, data) {
    await chrome.storage.local.set({ [key]: data });
  }

  /**
   * Get unencrypted data from Chrome storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Stored data
   */
  static async get(key) {
    const result = await chrome.storage.local.get([key]);
    return result[key] || null;
  }

  /**
   * Remove data from Chrome storage
   * @param {string|string[]} keys - Key(s) to remove
   * @returns {Promise<void>}
   */
  static async remove(keys) {
    await chrome.storage.local.remove(Array.isArray(keys) ? keys : [keys]);
  }

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  static async clear() {
    await chrome.storage.local.clear();
  }

  /**
   * Initialize storage with default values
   * @returns {Promise<void>}
   */
  static async initialize() {
    const settings = await this.get('settings');
    if (!settings) {
      await this.save('settings', {
        theme: 'light',
        autoFill: true,
        showPreview: true,
        sessionTimeout: 15, // minutes
        failedAttempts: 0,
        lockedUntil: null
      });
    }

    const formMappings = await this.get('formMappings');
    if (!formMappings) {
      await this.save('formMappings', {});
    }
  }
}

