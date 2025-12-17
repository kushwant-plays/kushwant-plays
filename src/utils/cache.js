// Cache utility to reduce database reads
export const cacheManager = {
  set: (key, data, ttl = 300000) => { // 5 minutes default
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Clear old cache entries
        this.clearOldEntries();
        console.warn('LocalStorage quota exceeded, cleared old entries');
      }
    }
  },

  get: (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  },

  clear: (pattern) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  },

  clearOldEntries: () => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item.timestamp && now - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    });
  }
};