/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Application constants and configuration values
 */
/**
 * Bot version information
 */
const VERSION = {
    MAJOR: 2,
    MINOR: 0,
    PATCH: 0,
    TAG: 'alpha',
    BUILD: 1,
    get FULL() {
        return `v${this.MAJOR}.${this.MINOR}.${this.PATCH}-${this.TAG}-${this.BUILD}`;
    },
};
/**
 * Cache TTL values (in milliseconds)
 */
const CACHE_TTL = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};
/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
    COMMANDS: {
        DEFAULT_COOLDOWN: 5, // seconds
        MAX_ATTEMPTS: 5, // before blacklist
        COOLDOWN_RANGE: {
            MIN: 1,
            MAX: 60,
        },
    },
    WEBHOOKS: {
        QUEUE_DELAY: 1000, // 1 second between webhook calls
        RETRY_AFTER: 2000, // 2 seconds retry delay
    },
};
/**
 * Discord API error codes to ignore
 */
const IGNORED_ERROR_CODES = new Set([
    10008, // Unknown Message
    4000, // Unknown error
    10001, // Unknown Application
    10003, // Unknown Channel
    10004, // Unknown Guild
    10005, // Unknown Integration
    50001, // Missing Access
    10062, // Unknown Interaction
    50013, // Missing Permissions
    50035, // Invalid Form Body
]);
/**
 * Embed color schemes
 */
const COLORS = {
    PRIMARY: 0x5865f2,
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    WARNING: 0xffa500,
    INFO: 0x00bfff,
};
/**
 * Emoji constants
 */
const EMOJIS = {
    TICK: '✅',
    CROSS: '❌',
    DOT: '•',
    PROCESS: '⏳',
    DISABLE: '🔴',
    ENABLE: '🟢',
    PROTECT: '🛡️',
    HII: '👋',
    WARNING: '⚠️',
    INFO: 'ℹ️',
};
/**
 * Log level priorities
 */
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    READY: 2,
    EVENT: 3,
    CMD: 3,
    DEBUG: 4,
    SHARD: 3,
};
/**
 * Pagination configuration
 */
const PAGINATION = {
    ITEMS_PER_PAGE: 10,
    BUTTON_TIMEOUT: 60000, // 1 minute
    MAX_PAGES: 100,
};
/**
 * Database configuration
 */
const DATABASE = {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    TIMEOUT: 30000, // 30 seconds
};
/**
 * Message content limits
 */
const LIMITS = {
    EMBED_DESCRIPTION: 4096,
    EMBED_FIELD_NAME: 256,
    EMBED_FIELD_VALUE: 1024,
    EMBED_FOOTER: 2048,
    EMBED_AUTHOR: 256,
    EMBED_TITLE: 256,
    EMBED_FIELDS: 25,
    MESSAGE_CONTENT: 2000,
};
/**
 * Feature flags
 */
const FEATURES = {
    HEALTH_CHECK: process.env.ENABLE_HEALTH_CHECK === 'true',
    METRICS: process.env.ENABLE_METRICS === 'true',
    DEBUG_MODE: process.env.DEBUG === 'true',
    MAINTENANCE_MODE: false,
};
/**
 * Time constants
 */
const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
};
export { VERSION, CACHE_TTL, RATE_LIMITS, IGNORED_ERROR_CODES, COLORS, EMOJIS, LOG_LEVELS, PAGINATION, DATABASE, LIMITS, FEATURES, TIME, };
//# sourceMappingURL=constants.js.map