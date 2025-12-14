/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Health check and monitoring utilities
 */

import os from 'os';
import express from 'express';

class HealthCheck {
    private client: any;
    constructor(client: any) {
        this.client = client;
        this.startTime = Date.now();
    }

    /**
     * Get system health metrics
     * @returns {Object} Health metrics
     */
    getSystemMetrics() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
            memory: {
                total: this.formatBytes(totalMem),
                free: this.formatBytes(freeMem),
                used: this.formatBytes(usedMem),
                percentage: ((usedMem / totalMem) * 100).toFixed(2),
            },
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0]?.model || 'Unknown',
                load: os.loadavg(),
            },
            uptime: {
                system: this.formatUptime(os.uptime()),
                process: this.formatUptime(process.uptime()),
                bot: this.formatUptime((Date.now() - this.startTime) / 1000),
            },
        };
    }

    /**
     * Get bot health status
     * @returns {Object} Bot health status
     */
    getBotStatus() {
        return {
            status: this.client.ready ? 'healthy' : 'unhealthy',
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size,
            channels: this.client.channels.cache.size,
            commands: this.client.commands.size,
            ping: this.client.ws.ping,
            shardId: this.client.cluster?.id,
            shardCount: this.client.cluster?.count,
        };
    }

    /**
     * Get database health status
     * @returns {Promise<Object>} Database status
     */
    async getDatabaseStatus() {
        try {
            const startTime = Date.now();
            await this.client.db.ping();
            const latency = Date.now() - startTime;

            return {
                status: 'healthy',
                latency: `${latency}ms`,
                type: 'JoshDB',
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }

    /**
     * Get comprehensive health report
     * @returns {Promise<Object>} Complete health report
     */
    async getHealthReport() {
        const system = this.getSystemMetrics();
        const bot = this.getBotStatus();
        const database = await this.getDatabaseStatus();

        return {
            timestamp: new Date().toISOString(),
            version: 'v2-alpha-1',
            system,
            bot,
            database,
            overall:
                bot.status === 'healthy' && database.status === 'healthy' ? 'healthy' : 'degraded',
        };
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
    }

    /**
     * Format uptime to human readable format
     * @param {number} seconds - Uptime in seconds
     * @returns {string} Formatted uptime
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);

        return parts.join(' ') || '0s';
    }

    /**
     * Start health check HTTP server
     * @param {number} port - Port to listen on
     */
    startHealthServer(port = 3000) {
        const app = express();

        app.get('/health', async (req, res) => {
            const report = await this.getHealthReport();
            res.json(report);
        });

        app.get('/ping', (req, res) => {
            res.json({ status: 'pong', timestamp: Date.now() });
        });

        app.listen(port, () => {
            this.client.logger.log(`Health check server listening on port ${port}`, 'info');
        });
    }
}

export default HealthCheck;
