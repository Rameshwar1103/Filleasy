/**
 * Crypto Utilities - Enterprise-grade encryption for Filleasy
 * Uses Web Crypto API for AES-256-GCM encryption and PBKDF2 hashing
 */

class CryptoUtils {
  /**
   * Derive key from password using PBKDF2
   * @param {string} password - Master password
   * @param {Uint8Array} salt - Random salt
   * @returns {Promise<CryptoKey>} - Derived key
   */
  static async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random salt
   * @returns {Uint8Array} - 16-byte random salt
   */
  static generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} data - Data to encrypt (JSON string)
   * @param {CryptoKey} key - Encryption key
   * @returns {Promise<string>} - Encrypted data as base64 string
   */
  static async encrypt(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {string} encryptedData - Base64 encrypted data
   * @param {CryptoKey} key - Decryption key
   * @returns {Promise<string>} - Decrypted JSON string
   */
  static async decrypt(encryptedData, key) {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Hash password using PBKDF2 (for master password storage)
   * @param {string} password - Password to hash
   * @param {Uint8Array} salt - Salt (if existing, otherwise generates new)
   * @returns {Promise<{hash: string, salt: string}>} - Hash and salt as base64
   */
  static async hashPassword(password, salt = null) {
    if (!salt) {
      salt = this.generateSalt();
    } else {
      salt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    return {
      hash: btoa(String.fromCharCode(...new Uint8Array(hashBuffer))),
      salt: btoa(String.fromCharCode(...salt))
    };
  }

  /**
   * Verify password against stored hash
   * @param {string} password - Password to verify
   * @param {string} storedHash - Stored hash (base64)
   * @param {string} storedSalt - Stored salt (base64)
   * @returns {Promise<boolean>} - True if password matches
   */
  static async verifyPassword(password, storedHash, storedSalt) {
    const { hash } = await this.hashPassword(password, storedSalt);
    return hash === storedHash;
  }

  /**
   * Generate session token
   * @returns {string} - Random token
   */
  static generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
}

