/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Main entry point for Friday Discord Bot
 */

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import Friday from './structures/friday';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

dotenvConfig();

const config = await import(`${process.cwd()}/config.json`, {
    with: { type: 'json' }
}).then(module => module.default);

// Create client instance
const client = new Friday();

/**
 * Initialize and start the bot
 */
(async () => {
    try {
        console.log('╔════════════════════════════════════════╗');
        console.log('║     Friday Bot - Starting...          ║');
        console.log('║     Author: Tanmay                    ║');
        console.log('║     Recoded by: Nerox Studios         ║');
        console.log('║     Version: v2-alpha-1               ║');
        console.log('╚════════════════════════════════════════╝\n');

        // Load configuration
        client.logger.log('Loading configuration...');
        await client.loadConfig();

        // Setup centralized error handlers
        client.errorHandler.setupGlobalHandlers();

        // Initialize database
        client.logger.log('Initializing database...');
        await client.initializedata();

        // Initialize mongoose (legacy support)
        await client.initializeMongoose();

        // Load events
        client.logger.log('Loading events...');
        await client.loadEvents();

        // Load logs
        client.logger.log('Loading log handlers...');
        await client.loadlogs();

        // Load commands
        client.logger.log('Loading commands...');
        await client.loadMain();

        // Login to Discord
        client.logger.log('Connecting to Discord...');
        await client.login(client.config.TOKEN);

        // Start health check server if enabled
        if (process.env.HEALTH_CHECK_PORT) {
            const port = parseInt(process.env.HEALTH_CHECK_PORT, 10);
            client.healthCheck.startHealthServer(port);
        }
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        process.exit(1);
    }
})();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    try {
        await client.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    try {
        await client.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
