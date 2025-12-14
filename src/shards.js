/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Cluster manager for Friday Discord Bot
 */
import { ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const config = await import('../config.json', {
    with: { type: 'json' }
}).then(module => module.default);
// Initialize cluster manager - points to src/index.js
const manager = new ClusterManager(`${process.cwd()}/src/index.js`, {
    totalShards: 'auto',
    shardsPerClusters: 2,
    totalClusters: 'auto',
    mode: 'process',
    token: config.TOKEN
});
const webhookUrl = config.WEBHOOK_URL;
/**
 * Send logs to Discord webhook with rate limiting
 * @param {string} message - Message to log
 * @param {string} type - Log type (info, warn, error)
 */
const webhookQueue = [];
let isProcessingWebhook = false;
async function logToWebhook(message, type = 'info') {
    if (!webhookUrl)
        return;
    const colors = {
        info: 0x5865f2,
        warn: 0xffa500,
        error: 0xff0000,
        success: 0x00ff00,
    };
    webhookQueue.push({
        embeds: [
            {
                title: '🔷 Friday Cluster Manager',
                description: message,
                color: colors[type] || colors.info,
                footer: {
                    text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1',
                },
                timestamp: new Date().toISOString(),
            },
        ],
    });
    if (!isProcessingWebhook) {
        processWebhookQueue();
    }
}
async function processWebhookQueue() {
    if (webhookQueue.length === 0) {
        isProcessingWebhook = false;
        return;
    }
    isProcessingWebhook = true;
    const payload = webhookQueue.shift();
    try {
        await axios.post(webhookUrl, payload);
    }
    catch (error) {
        console.error('[Webhook] Failed to send log:', error.message);
    }
    // Wait 1 second before processing next item to avoid rate limits
    setTimeout(() => processWebhookQueue(), 1000);
}
// Display startup banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    ███████╗██████╗ ██╗██████╗  █████╗ ██╗   ██╗         ║
║    ██╔════╝██╔══██╗██║██╔══██╗██╔══██╗╚██╗ ██╔╝         ║
║    █████╗  ██████╔╝██║██║  ██║███████║ ╚████╔╝          ║
║    ██╔══╝  ██╔══██╗██║██║  ██║██╔══██║  ╚██╔╝           ║
║    ██║     ██║  ██║██║██████╔╝██║  ██║   ██║            ║
║    ╚═╝     ╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝            ║
║                                                           ║
║    Author: Tanmay                                        ║
║    Recoded by: Nerox Studios                             ║
║    Version: v2-alpha-1                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
// Cluster event handlers
manager.on('clusterCreate', cluster => {
    const message = `✅ Cluster #${cluster.id} launched successfully`;
    console.log(`[Cluster Manager] ${message}`);
    logToWebhook(message, 'success');
});
manager.on('clusterReady', cluster => {
    const message = `🟢 Cluster #${cluster.id} is ready and operational`;
    console.log(`[Cluster Manager] ${message}`);
    logToWebhook(message, 'success');
});
manager.on('clusterDisconnect', cluster => {
    const message = `🔴 Cluster #${cluster.id} disconnected! Attempting to respawn...`;
    console.log(`[Cluster Manager] ${message}`);
    logToWebhook(message, 'warn');
    manager.respawn(cluster.id).catch(err => {
        const errorMessage = `❌ Failed to respawn Cluster #${cluster.id}: ${err.message}`;
        console.error(`[Cluster Manager] ${errorMessage}`);
        logToWebhook(errorMessage, 'error');
    });
});
// Spawn clusters
console.log('[Cluster Manager] Spawning clusters...\n');
manager.spawn({ timeout: -1 });
// Extend with heartbeat manager for health monitoring
manager.extend(new HeartbeatManager({
    interval: 2000,
    maxMissedHeartbeats: 5,
}));
// Global error handlers
process.on('uncaughtException', error => {
    const errorMessage = `❌ Uncaught Exception: ${error.message}\n${error.stack}`;
    console.error(`[Cluster Manager] ${errorMessage}`);
    logToWebhook(errorMessage, 'error');
});
process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = `⚠️ Unhandled Promise Rejection: ${reason}`;
    console.error(`[Cluster Manager] ${errorMessage}`);
    logToWebhook(errorMessage, 'error');
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Cluster Manager] Shutting down gracefully...');
    await logToWebhook('🛑 Cluster Manager shutting down', 'warn');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n[Cluster Manager] Shutting down gracefully...');
    await logToWebhook('🛑 Cluster Manager shutting down', 'warn');
    process.exit(0);
});
//# sourceMappingURL=shards.js.map