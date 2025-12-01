// ============================================
// API CACHE - Prevent duplicate API calls
// Author: itqatarfoam-hub
// Date: 2025-11-23 09:40:15 UTC
// ============================================

const apiCache = {
  cache: new Map(),
  pending: new Map(),
  
  // Cache duration: 5 seconds
  CACHE_DURATION: 5000,

  async get(key, fetchFunction) {
    const now = Date.now();
    
    // Check cache
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log(`📦 Using cached data for: ${key}`);
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }

    // Check if already fetching
    if (this.pending.has(key)) {
      console.log(`⏳ Waiting for pending request: ${key}`);
      return await this.pending.get(key);
    }

    // Fetch new data
    console.log(`🌐 Fetching fresh data for: ${key}`);
    const promise = fetchFunction();
    this.pending.set(key, promise);

    try {
      const data = await promise;
      this.cache.set(key, { data, timestamp: now });
      this.pending.delete(key);
      return data;
    } catch (error) {
      this.pending.delete(key);
      throw error;
    }
  },

  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.pending.delete(key);
      console.log(`🗑️ Cleared cache for: ${key}`);
    } else {
      this.cache.clear();
      this.pending.clear();
      console.log('🗑️ Cleared all cache');
    }
  }
};

window.apiCache = apiCache;