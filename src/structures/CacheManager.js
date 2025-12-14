/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Modern cache manager with TTL support
 */
/**
 * In-memory cache with TTL (Time To Live) support
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
        };
    }
    /**
     * Set a value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} [ttl] - Time to live in milliseconds
     */
    set(key, value, ttl) {
        this.cache.set(key, value);
        this.stats.sets++;
        // Clear existing timeout if any
        if (this.ttls.has(key)) {
            clearTimeout(this.ttls.get(key));
        }
        // Set new timeout if TTL is provided
        if (ttl) {
            const timeout = setTimeout(() => {
                this.delete(key);
            }, ttl);
            this.ttls.set(key, timeout);
        }
    }
    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined
     */
    get(key) {
        const hasKey = this.cache.has(key);
        if (hasKey) {
            this.stats.hits++;
            return this.cache.get(key);
        }
        this.stats.misses++;
        return undefined;
    }
    /**
     * Get or set pattern - gets value if exists, otherwise sets and returns it
     * @param {string} key - Cache key
     * @param {Function} factory - Factory function to generate value if not cached
     * @param {number} [ttl] - Time to live in milliseconds
     * @returns {Promise<*>} Cached or generated value
     */
    async getOrSet(key, factory, ttl) {
        if (this.has(key)) {
            return this.get(key);
        }
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean} True if key exists
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     * @returns {boolean} True if key was deleted
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            // Clear timeout if exists
            if (this.ttls.has(key)) {
                clearTimeout(this.ttls.get(key));
                this.ttls.delete(key);
            }
        }
        return deleted;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        // Clear all timeouts
        for (const timeout of this.ttls.values()) {
            clearTimeout(timeout);
        }
        this.cache.clear();
        this.ttls.clear();
    }
    /**
     * Get cache size
     * @returns {number} Number of cached entries
     */
    size() {
        return this.cache.size;
    }
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
            : 0;
        return {
            ...this.stats,
            size: this.size(),
            hitRate: `${hitRate.toFixed(2)}%`,
        };
    }
    /**
     * Reset cache statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
        };
    }
    /**
     * Get all keys matching a pattern
     * @param {string} pattern - Pattern to match (supports wildcards)
     * @returns {string[]} Array of matching keys
     */
    keys(pattern) {
        if (!pattern) {
            return Array.from(this.cache.keys());
        }
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        return Array.from(this.cache.keys()).filter((key) => regex.test(key));
    }
    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern to match
     * @returns {number} Number of deleted keys
     */
    deletePattern(pattern) {
        const keys = this.keys(pattern);
        let deleted = 0;
        for (const key of keys) {
            if (this.delete(key)) {
                deleted++;
            }
        }
        return deleted;
    }
    /**
     * Set multiple values at once
     * @param {Object} entries - Object with key-value pairs
     * @param {number} [ttl] - Time to live in milliseconds
     */
    mset(entries, ttl) {
        for (const [key, value] of Object.entries(entries)) {
            this.set(key, value, ttl);
        }
    }
    /**
     * Get multiple values at once
     * @param {string[]} keys - Array of keys to get
     * @returns {Object} Object with key-value pairs
     */
    mget(keys) {
        const result = {};
        for (const key of keys) {
            if (this.has(key)) {
                result[key] = this.get(key);
            }
        }
        return result;
    }
}
export default CacheManager;
//# sourceMappingURL=CacheManager.js.map