/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Feature flag system for gradual feature rollouts
 */

class FeatureManager {
    constructor(client) {
        this.client = client;
        this.features = new Map();
        this.featureUsage = new Map();
        this.configFile = 'feature-flags.json';
    }

    /**
     * Initialize feature manager
     */
    async initialize() {
        await this.loadFeatures();
        this.client.logger.info('Feature manager initialized');
    }

    /**
     * Load feature flags from database or file
     */
    async loadFeatures() {
        try {
            // Try to load from database first
            const dbFeatures = await this.client.db.get('feature_flags');
            
            if (dbFeatures) {
                Object.entries(dbFeatures).forEach(([key, value]) => {
                    this.features.set(key, value);
                });
                this.client.logger.debug(`Loaded ${this.features.size} feature flags`);
            } else {
                // Load default features
                this.loadDefaultFeatures();
            }
        } catch (error) {
            this.client.logger.warn('Failed to load features from DB, using defaults');
            this.loadDefaultFeatures();
        }
    }

    /**
     * Load default feature flags
     */
    loadDefaultFeatures() {
        const defaultFeatures = {
            // Auto-update features
            auto_update: {
                enabled: false,
                description: 'Automatic bot updates',
                rollout: 0, // Percentage of guilds (0-100)
                beta: true,
            },
            // New command features
            ai_commands: {
                enabled: false,
                description: 'AI-powered commands',
                rollout: 0,
                beta: true,
            },
            // Performance features
            enhanced_caching: {
                enabled: true,
                description: 'Enhanced caching system',
                rollout: 100,
                beta: false,
            },
            // Monitoring features
            advanced_metrics: {
                enabled: true,
                description: 'Advanced performance metrics',
                rollout: 100,
                beta: false,
            },
            // Experimental features
            voice_ai: {
                enabled: false,
                description: 'Voice AI integration',
                rollout: 0,
                beta: true,
            },
        };

        Object.entries(defaultFeatures).forEach(([key, value]) => {
            this.features.set(key, value);
        });

        this.client.logger.debug('Loaded default feature flags');
    }

    /**
     * Check if feature is enabled for a guild
     * @param {string} featureName - Feature name
     * @param {string} guildId - Guild ID
     * @returns {boolean} Feature enabled status
     */
    isEnabled(featureName, guildId) {
        const feature = this.features.get(featureName);
        
        if (!feature) {
            this.client.logger.warn(`Unknown feature: ${featureName}`);
            return false;
        }

        // If feature is disabled globally, return false
        if (!feature.enabled) {
            return false;
        }

        // If 100% rollout, return true
        if (feature.rollout >= 100) {
            return true;
        }

        // If 0% rollout, return false
        if (feature.rollout === 0) {
            return false;
        }

        // Calculate based on guild ID hash for consistent rollout
        const hash = this.hashGuildId(guildId);
        const bucket = hash % 100;
        
        return bucket < feature.rollout;
    }

    /**
     * Hash guild ID for consistent rollout
     * @param {string} guildId - Guild ID
     * @returns {number} Hash value
     */
    hashGuildId(guildId) {
        let hash = 0;
        const str = String(guildId);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // Use unsigned 32-bit operations to prevent overflow
            hash = ((hash << 5) - hash + char) >>> 0;
        }
        return hash;
    }

    /**
     * Enable a feature
     * @param {string} featureName - Feature name
     * @param {number} rollout - Rollout percentage (0-100)
     */
    async enableFeature(featureName, rollout = 100) {
        const feature = this.features.get(featureName);
        
        if (!feature) {
            this.client.logger.error(`Cannot enable unknown feature: ${featureName}`);
            return false;
        }

        feature.enabled = true;
        feature.rollout = Math.min(100, Math.max(0, rollout));
        this.features.set(featureName, feature);

        await this.saveFeatures();
        
        this.client.logger.info(
            `Feature "${featureName}" enabled with ${rollout}% rollout`
        );
        
        return true;
    }

    /**
     * Disable a feature
     * @param {string} featureName - Feature name
     */
    async disableFeature(featureName) {
        const feature = this.features.get(featureName);
        
        if (!feature) {
            this.client.logger.error(`Cannot disable unknown feature: ${featureName}`);
            return false;
        }

        feature.enabled = false;
        feature.rollout = 0;
        this.features.set(featureName, feature);

        await this.saveFeatures();
        
        this.client.logger.info(`Feature "${featureName}" disabled`);
        
        return true;
    }

    /**
     * Update feature rollout percentage
     * @param {string} featureName - Feature name
     * @param {number} rollout - New rollout percentage
     */
    async updateRollout(featureName, rollout) {
        const feature = this.features.get(featureName);
        
        if (!feature) {
            this.client.logger.error(`Cannot update unknown feature: ${featureName}`);
            return false;
        }

        const oldRollout = feature.rollout;
        feature.rollout = Math.min(100, Math.max(0, rollout));
        this.features.set(featureName, feature);

        await this.saveFeatures();
        
        this.client.logger.info(
            `Feature "${featureName}" rollout updated: ${oldRollout}% -> ${rollout}%`
        );
        
        return true;
    }

    /**
     * Add a new feature flag
     * @param {string} featureName - Feature name
     * @param {Object} config - Feature configuration
     */
    async addFeature(featureName, config) {
        if (this.features.has(featureName)) {
            this.client.logger.warn(`Feature already exists: ${featureName}`);
            return false;
        }

        const feature = {
            enabled: config.enabled ?? false,
            description: config.description ?? 'No description',
            rollout: config.rollout ?? 0,
            beta: config.beta ?? true,
        };

        this.features.set(featureName, feature);
        await this.saveFeatures();

        this.client.logger.info(`New feature added: ${featureName}`);
        
        return true;
    }

    /**
     * Track feature usage
     * @param {string} featureName - Feature name
     * @param {string} guildId - Guild ID
     */
    trackUsage(featureName, guildId) {
        const key = `${featureName}:${guildId}`;
        const count = this.featureUsage.get(key) || 0;
        this.featureUsage.set(key, count + 1);
    }

    /**
     * Get feature usage statistics
     * @param {string} featureName - Feature name
     * @returns {Object} Usage statistics
     */
    getUsageStats(featureName) {
        const stats = {
            totalUsage: 0,
            guilds: new Set(),
        };

        for (const [key, count] of this.featureUsage.entries()) {
            if (key.startsWith(`${featureName}:`)) {
                stats.totalUsage += count;
                const guildId = key.split(':')[1];
                stats.guilds.add(guildId);
            }
        }

        return {
            feature: featureName,
            totalUsage: stats.totalUsage,
            uniqueGuilds: stats.guilds.size,
        };
    }

    /**
     * Get all features
     * @returns {Object[]} List of features
     */
    getAllFeatures() {
        return Array.from(this.features.entries()).map(([name, config]) => ({
            name,
            ...config,
        }));
    }

    /**
     * Get enabled features for a guild
     * @param {string} guildId - Guild ID
     * @returns {string[]} List of enabled feature names
     */
    getEnabledFeatures(guildId) {
        return Array.from(this.features.keys()).filter((name) =>
            this.isEnabled(name, guildId)
        );
    }

    /**
     * Save features to database
     */
    async saveFeatures() {
        try {
            const featuresObj = Object.fromEntries(this.features);
            await this.client.db.set('feature_flags', featuresObj);
            this.client.logger.debug('Feature flags saved');
        } catch (error) {
            this.client.logger.error('Failed to save feature flags:', error.message);
        }
    }

    /**
     * Get feature status report
     * @returns {Object} Status report
     */
    getStatusReport() {
        const features = this.getAllFeatures();
        
        return {
            totalFeatures: features.length,
            enabled: features.filter((f) => f.enabled).length,
            beta: features.filter((f) => f.beta).length,
            features: features.map((f) => ({
                name: f.name,
                enabled: f.enabled,
                rollout: `${f.rollout}%`,
                beta: f.beta,
                description: f.description,
            })),
        };
    }
}

module.exports = FeatureManager;
