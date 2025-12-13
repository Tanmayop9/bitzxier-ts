/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Main entry point for Friday Discord Bot
 */

require('dotenv').config();
require('module-alias/register');
const Friday = require('./structures/friday.js');
const config = require(`${process.cwd()}/config.json`);

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

        // Initialize SQL databases
        client.logger.log('Initializing SQL databases...');
        await client.SQL();

        // Load commands
        client.logger.log('Loading commands...');
        await client.loadMain();

        // Login to Discord
        client.logger.log('Connecting to Discord...');
        await client.login(config.TOKEN);

        // Initialize feature manager
        client.logger.log('Initializing feature manager...');
        await client.featureManager.initialize();

        // Initialize command scheduler
        client.logger.log('Initializing command scheduler...');
        await client.commandScheduler.initialize();

        // Initialize announcement manager
        client.logger.log('Initializing announcement manager...');
        await client.announcementManager.initialize();

        // Initialize auto-updater (after announcement manager)
        client.logger.log('Initializing auto-updater...');
        await client.autoUpdater.initialize();

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
