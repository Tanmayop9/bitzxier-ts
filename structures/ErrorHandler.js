/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Centralized error handling for the application
 */

const chalk = require('chalk');
const { IGNORED_ERROR_CODES } = require('./constants');

/**
 * Custom error classes for better error handling
 */
class BotError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'BotError';
        this.code = code;
        this.timestamp = new Date();
    }
}

class DatabaseError extends BotError {
    constructor(message) {
        super(message, 'DB_ERROR');
        this.name = 'DatabaseError';
    }
}

class CommandError extends BotError {
    constructor(message, commandName) {
        super(message, 'CMD_ERROR');
        this.name = 'CommandError';
        this.commandName = commandName;
    }
}

class PermissionError extends BotError {
    constructor(message, required) {
        super(message, 'PERM_ERROR');
        this.name = 'PermissionError';
        this.required = required;
    }
}

/**
 * Main error handler class
 */
class ErrorHandler {
    constructor(client) {
        this.client = client;
        this.ignoredCodes = IGNORED_ERROR_CODES;
    }

    /**
     * Check if error should be ignored
     * @param {Error} error - Error object
     * @returns {boolean}
     */
    shouldIgnore(error) {
        return error?.code && this.ignoredCodes.has(error.code);
    }

    /**
     * Handle error with appropriate logging and notification
     * @param {Error} error - Error object
     * @param {Object} context - Additional context (message, guild, etc.)
     */
    async handle(error, context = {}) {
        if (this.shouldIgnore(error)) {
            return;
        }

        const errorInfo = {
            name: error.name || 'Unknown Error',
            message: error.message || 'No error message',
            stack: error.stack || 'No stack trace',
            code: error.code || 'UNKNOWN',
            timestamp: new Date().toISOString(),
            context: {
                guild: context.guild?.id,
                channel: context.channel?.id,
                user: context.user?.id,
                command: context.command,
            },
        };

        // Log to console
        console.error(
            chalk.red(`[ERROR] ${errorInfo.name}:`),
            chalk.yellow(errorInfo.message)
        );
        console.error(chalk.gray(errorInfo.stack));

        // Send to webhook if available
        if (this.client.error) {
            const errorMessage = this.formatErrorForWebhook(errorInfo);
            await this.client.error.send(errorMessage).catch(() => {});
        }
    }

    /**
     * Format error for webhook notification
     * @param {Object} errorInfo - Error information
     * @returns {Object} Formatted message
     */
    formatErrorForWebhook(errorInfo) {
        const contextStr = Object.entries(errorInfo.context)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n') || 'No context';

        const message = [
            `**${errorInfo.name}** (Code: ${errorInfo.code})`,
            `\`\`\`js\n${errorInfo.message}\`\`\``,
            `**Context:**\n${contextStr}`,
            `**Time:** ${errorInfo.timestamp}`,
        ].join('\n');

        // Truncate if too long
        return { content: message.substring(0, 2000) };
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        process.on('unhandledRejection', (error) => {
            this.handle(error, { source: 'unhandledRejection' });
        });

        process.on('uncaughtException', (error) => {
            this.handle(error, { source: 'uncaughtException' });
            // In production, we might want to restart after logging
        });

        process.on('warning', (warning) => {
            console.warn(chalk.yellow('[WARNING]'), warning.message);
        });

        // Discord.js client error handler
        if (this.client) {
            this.client.on('error', (error) => {
                this.handle(error, { source: 'clientError' });
            });
        }
    }
}

module.exports = {
    ErrorHandler,
    BotError,
    DatabaseError,
    CommandError,
    PermissionError,
};
