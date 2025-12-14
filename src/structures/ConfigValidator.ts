/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Configuration validator for environment variables and config
 */

class ConfigValidator {
    /**
     * Validate required configuration fields
     * @param {Object} config - Configuration object to validate
     * @returns {Object} Validation result with success flag and errors
     */
    static validate(config) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!config.TOKEN || config.TOKEN === '') {
            errors.push('TOKEN is required in config.json');
        }

        // Optional but recommended fields
        if (!config.owner || config.owner.length === 0) {
            warnings.push('No owner IDs configured');
        }

        if (!config.WEBHOOK_URL || config.WEBHOOK_URL === '') {
            warnings.push('WEBHOOK_URL not configured - logging features may be limited');
        }

        // Validate array fields
        const arrayFields = ['owner', 'friday', 'mainmode', 'premium', 'admin', 'np'];
        arrayFields.forEach((field) => {
            if (config[field] && !Array.isArray(config[field])) {
                errors.push(`${field} must be an array`);
            }
        });

        // Validate boolean fields
        if (typeof config.cooldown !== 'boolean') {
            warnings.push('cooldown should be a boolean value');
        }

        return {
            success: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Get environment-specific configuration
     * @returns {string} Current environment
     */
    static getEnvironment() {
        return process.env.NODE_ENV || 'development';
    }

    /**
     * Check if running in production
     * @returns {boolean}
     */
    static isProduction() {
        return this.getEnvironment() === 'production';
    }

    /**
     * Check if running in development
     * @returns {boolean}
     */
    static isDevelopment() {
        return this.getEnvironment() === 'development';
    }
}

export default ConfigValidator;
