// ============================================
// API RETRY - Handle rate limit errors
// Author: itqatarfoam-hub
// Date: 2025-11-23 09:40:15 UTC
// ============================================

const apiRetry = {
  async fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        
        // If rate limited, wait and retry
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 2;
          console.warn(`⚠️ Rate limited. Retrying after ${retryAfter}s...`);
          await this.sleep(retryAfter * 1000);
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Request failed (attempt ${i + 1}/${maxRetries}):`, error.message);
        
        if (i < maxRetries - 1) {
          await this.sleep(1000 * (i + 1)); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

window.apiRetry = apiRetry;