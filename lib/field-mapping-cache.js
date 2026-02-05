/**
 * Field Mapping Cache
 * Caches successful field mappings to improve future performance
 */

(function() {
  'use strict';

  class FieldMappingCache {
    constructor() {
      this.cache = {};
      this.loaded = false;
    }

    /**
     * Load cache from storage
     */
    async load() {
      if (this.loaded) return;
      
      try {
        const result = await chrome.storage.local.get('fieldMappingCache');
        this.cache = result.fieldMappingCache || {};
        this.loaded = true;
        console.log('[Filleasy] Field cache loaded:', Object.keys(this.cache).length, 'entries');
      } catch (error) {
        console.warn('[Filleasy] Failed to load field cache:', error);
      }
    }

    /**
     * Store a mapping
     * @param {string} label - Field label from form
     * @param {string} fieldKey - Internal profile field key
     * @param {number} confidence - Match confidence
     */
    async store(label, fieldKey, confidence) {
      if (!label || !fieldKey) return;
      
      // Normalize label
      const normalizedLabel = label.trim();
      
      // Update in-memory cache
      this.cache[normalizedLabel] = {
        field: fieldKey,
        confidence: confidence,
        timestamp: Date.now()
      };
      
      // Persist to storage (debounced in a real app, but direct here for simplicity)
      try {
        await chrome.storage.local.set({ fieldMappingCache: this.cache });
      } catch (error) {
        console.warn('[Filleasy] Failed to save field cache:', error);
      }
    }

    /**
     * Get a cached mapping
     * @param {string} label - Field label
     * @returns {Object|null} - Cached mapping or null
     */
    get(label) {
      if (!label) return null;
      const normalizedLabel = label.trim();
      return this.cache[normalizedLabel] || null;
    }

    /**
     * Clear cache
     */
    async clear() {
      this.cache = {};
      await chrome.storage.local.remove('fieldMappingCache');
    }

    /**
     * Cleanup old entries (older than 30 days)
     */
    async cleanup() {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      let changed = false;
      
      Object.keys(this.cache).forEach(key => {
        if (now - this.cache[key].timestamp > thirtyDays) {
          delete this.cache[key];
          changed = true;
        }
      });
      
      if (changed) {
        await chrome.storage.local.set({ fieldMappingCache: this.cache });
      }
    }
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.FieldMappingCache = new FieldMappingCache();
  }

})();
