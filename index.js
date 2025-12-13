/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Main entry point for Friday Discord Bot
 */

const wait = require('wait');
require('dotenv').config();
require('module-alias/register');
const path = require('path');
const Friday = require(`./structures/Bitzxier.js`);
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

        // Initialize database
        client.logger.log('Initializing database...');
        await client.initializedata();
        
        // Initialize mongoose (legacy support)
        await client.initializeMongoose();
        
        // Wait for initialization
        await wait(2000);
        
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
        
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        process.exit(1);
    }
})();

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    if (client.error) {
        client.error.send(`\`\`\`js\nUnhandled Rejection:\n${error.stack}\`\`\``).catch(() => {});
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (client.error) {
        client.error.send(`\`\`\`js\nUncaught Exception:\n${error.stack}\`\`\``).catch(() => {});
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    client.destroy();
    process.exit(0);
});
