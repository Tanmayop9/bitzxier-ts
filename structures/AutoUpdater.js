/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Safe auto-update system with rollback support
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoUpdater {
    constructor(client) {
        this.client = client;
        this.updateCheckInterval = null;
        this.config = {
            enabled: process.env.AUTO_UPDATE_ENABLED === 'true',
            checkInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL) || 3600000, // 1 hour
            autoApply: process.env.AUTO_APPLY_UPDATES === 'true',
            githubRepo: process.env.GITHUB_REPO || 'Tanmayop9/soward-test',
            branch: process.env.UPDATE_BRANCH || 'main',
            backupDir: path.join(process.cwd(), 'backups'),
        };
        this.currentVersion = require(path.join(process.cwd(), 'package.json')).version;
        this.updateInProgress = false;
    }

    /**
     * Initialize the auto-updater
     */
    async initialize() {
        if (!this.config.enabled) {
            this.client.logger.info('Auto-updater is disabled');
            return;
        }

        this.client.logger.info('Initializing auto-updater...');

        // Ensure backup directory exists
        if (!fs.existsSync(this.config.backupDir)) {
            fs.mkdirSync(this.config.backupDir, { recursive: true });
        }

        // Start periodic update checks
        this.startUpdateChecks();

        // Check for updates on startup
        await this.checkForUpdates();
    }

    /**
     * Start periodic update checks
     */
    startUpdateChecks() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }

        this.updateCheckInterval = setInterval(async () => {
            await this.checkForUpdates();
        }, this.config.checkInterval);

        this.client.logger.info(
            `Update checks scheduled every ${this.config.checkInterval / 60000} minutes`
        );
    }

    /**
     * Check for available updates
     * @returns {Promise<Object>} Update information
     */
    async checkForUpdates() {
        if (this.updateInProgress) {
            this.client.logger.warn('Update already in progress, skipping check');
            return null;
        }

        try {
            this.client.logger.debug('Checking for updates...');

            // Get latest commit from GitHub
            const latestCommit = await this.getLatestCommit();
            const currentCommit = await this.getCurrentCommit();

            if (!latestCommit || !currentCommit) {
                this.client.logger.warn('Could not determine commit information');
                return null;
            }

            if (latestCommit.sha === currentCommit) {
                this.client.logger.debug('Bot is up to date');
                return { upToDate: true, current: currentCommit };
            }

            const updateInfo = {
                upToDate: false,
                current: currentCommit,
                latest: latestCommit.sha,
                message: latestCommit.message,
                author: latestCommit.author,
                date: latestCommit.date,
                url: latestCommit.url,
            };

            this.client.logger.info(`Update available: ${latestCommit.message}`);
            await this.notifyUpdate(updateInfo);

            // Auto-apply if configured
            if (this.config.autoApply) {
                await this.applyUpdate(updateInfo);
            }

            return updateInfo;
        } catch (error) {
            this.client.logger.error('Error checking for updates:', error.message);
            await this.client.errorHandler.handle(error, { source: 'AutoUpdater' });
            return null;
        }
    }

    /**
     * Validate repository and branch names
     * @param {string} repo - Repository name
     * @param {string} branch - Branch name
     * @returns {boolean} Valid or not
     */
    validateInput(repo, branch) {
        // Only allow alphanumeric, hyphens, underscores, and forward slashes
        const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
        const branchRegex = /^[a-zA-Z0-9_.-]+$/;
        return repoRegex.test(repo) && branchRegex.test(branch);
    }

    /**
     * Get latest commit from GitHub
     * @returns {Promise<Object>} Commit information
     */
    async getLatestCommit() {
        try {
            // Validate inputs to prevent URL injection
            if (!this.validateInput(this.config.githubRepo, this.config.branch)) {
                throw new Error('Invalid repository or branch name');
            }

            const url = `https://api.github.com/repos/${this.config.githubRepo}/commits/${this.config.branch}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Friday-Bot-AutoUpdater',
                },
            });

            return {
                sha: response.data.sha,
                message: response.data.commit.message,
                author: response.data.commit.author.name,
                date: response.data.commit.author.date,
                url: response.data.html_url,
            };
        } catch (error) {
            this.client.logger.error('Failed to fetch latest commit:', error.message);
            return null;
        }
    }

    /**
     * Get current commit SHA
     * @returns {Promise<string>} Current commit SHA
     */
    async getCurrentCommit() {
        try {
            const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
            return sha;
        } catch (error) {
            this.client.logger.error('Failed to get current commit:', error.message);
            return null;
        }
    }

    /**
     * Notify about available update
     * @param {Object} updateInfo - Update information
     */
    async notifyUpdate(updateInfo) {
        const embed = {
            title: '🔄 Update Available',
            color: 0x00ff00,
            description: `A new update is available for Friday Bot!`,
            fields: [
                { name: 'Commit Message', value: updateInfo.message },
                { name: 'Author', value: updateInfo.author, inline: true },
                { name: 'Current', value: updateInfo.current.substring(0, 7), inline: true },
                { name: 'Latest', value: updateInfo.latest.substring(0, 7), inline: true },
                {
                    name: 'Auto-Apply',
                    value: this.config.autoApply ? '✅ Enabled' : '❌ Disabled',
                },
            ],
            footer: { text: 'Friday Bot Auto-Updater' },
            timestamp: new Date().toISOString(),
            url: updateInfo.url,
        };

        // Send to webhook if available
        if (this.client.error) {
            await this.client.error
                .send({ embeds: [embed] })
                .catch(() => this.client.logger.warn('Failed to send update notification'));
        }

        // Log to console
        this.client.logger.info(`Update: ${updateInfo.message} by ${updateInfo.author}`);
    }

    /**
     * Apply the update with safety checks
     * @param {Object} updateInfo - Update information
     * @returns {Promise<boolean>} Success status
     */
    async applyUpdate(updateInfo) {
        if (this.updateInProgress) {
            this.client.logger.warn('Update already in progress');
            return false;
        }

        this.updateInProgress = true;
        this.client.logger.info('Starting update process...');

        try {
            // Create backup
            const backupPath = await this.createBackup();
            if (!backupPath) {
                throw new Error('Failed to create backup');
            }

            this.client.logger.info(`Backup created: ${backupPath}`);

            // Stash local changes
            try {
                execSync('git stash', { encoding: 'utf-8' });
                this.client.logger.debug('Local changes stashed');
            } catch (error) {
                this.client.logger.debug('No local changes to stash');
            }

            // Pull latest changes (branch validated earlier)
            this.client.logger.info('Pulling latest changes...');
            if (!this.validateInput(this.config.githubRepo, this.config.branch)) {
                throw new Error('Invalid branch name');
            }
            execSync(`git pull origin "${this.config.branch}"`, { encoding: 'utf-8' });

            // Install dependencies
            this.client.logger.info('Installing dependencies...');
            execSync('npm install --production', { encoding: 'utf-8' });

            // Run health check
            const healthy = await this.performHealthCheck();
            if (!healthy) {
                throw new Error('Health check failed after update');
            }

            this.client.logger.info('✅ Update applied successfully!');

            // Notify success
            await this.notifyUpdateSuccess(updateInfo);

            // Announce update to all servers
            if (this.client.announcementManager) {
                await this.client.announcementManager.announceUpdate(updateInfo);
            }

            // Schedule restart
            await this.scheduleRestart();

            return true;
        } catch (error) {
            this.client.logger.error('Update failed:', error.message);

            // Attempt rollback
            await this.rollback();

            // Notify failure
            await this.notifyUpdateFailure(error, updateInfo);

            return false;
        } finally {
            this.updateInProgress = false;
        }
    }

    /**
     * Create backup of current state
     * @returns {Promise<string>} Backup path
     */
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            // Sanitize timestamp to prevent injection
            const safeTimestamp = timestamp.replace(/[^a-zA-Z0-9-]/g, '');
            const backupName = `backup-${safeTimestamp}.tar.gz`;
            const backupPath = path.join(this.config.backupDir, backupName);

            // Use absolute paths to prevent injection
            const absoluteBackupPath = path.resolve(backupPath);
            const workingDir = process.cwd();

            // Create tar backup excluding node_modules, data, and logs
            execSync(
                `tar -czf "${absoluteBackupPath}" --exclude=node_modules --exclude=data-sets --exclude=Database --exclude=logs --exclude=backups -C "${workingDir}" .`,
                { encoding: 'utf-8' }
            );

            // Keep only last 5 backups
            this.cleanOldBackups(5);

            return backupPath;
        } catch (error) {
            this.client.logger.error('Backup creation failed:', error.message);
            return null;
        }
    }

    /**
     * Clean old backups keeping only specified number
     * @param {number} keep - Number of backups to keep
     */
    cleanOldBackups(keep) {
        try {
            const backups = fs
                .readdirSync(this.config.backupDir)
                .filter((f) => f.startsWith('backup-') && f.endsWith('.tar.gz'))
                .sort()
                .reverse();

            if (backups.length > keep) {
                const toDelete = backups.slice(keep);
                toDelete.forEach((backup) => {
                    fs.unlinkSync(path.join(this.config.backupDir, backup));
                    this.client.logger.debug(`Deleted old backup: ${backup}`);
                });
            }
        } catch (error) {
            this.client.logger.warn('Failed to clean old backups:', error.message);
        }
    }

    /**
     * Perform health check after update
     * @returns {Promise<boolean>} Health status
     */
    async performHealthCheck() {
        try {
            // Check if bot can still connect
            if (!this.client.isReady()) {
                return false;
            }

            // Check database
            const dbHealth = await this.client.healthCheck.getDatabaseStatus();
            if (dbHealth.status !== 'healthy') {
                return false;
            }

            // Check critical files exist
            const criticalFiles = ['package.json', 'index.js', 'structures/friday.js'];
            for (const file of criticalFiles) {
                if (!fs.existsSync(path.join(process.cwd(), file))) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            this.client.logger.error('Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Rollback to previous version
     */
    async rollback() {
        this.client.logger.warn('Attempting rollback...');

        try {
            // Reset to previous commit
            execSync('git reset --hard HEAD~1', { encoding: 'utf-8' });

            // Reinstall dependencies
            execSync('npm install --production', { encoding: 'utf-8' });

            this.client.logger.info('✅ Rollback successful');
        } catch (error) {
            this.client.logger.error('❌ Rollback failed:', error.message);
        }
    }

    /**
     * Schedule bot restart
     */
    async scheduleRestart() {
        this.client.logger.info('Bot will restart in 30 seconds...');

        setTimeout(() => {
            this.client.logger.info('Restarting bot...');
            process.exit(0); // Exit, let process manager restart
        }, 30000);
    }

    /**
     * Notify update success
     * @param {Object} updateInfo - Update information
     */
    async notifyUpdateSuccess(updateInfo) {
        const embed = {
            title: '✅ Update Applied Successfully',
            color: 0x00ff00,
            description: `Friday Bot has been updated successfully!`,
            fields: [
                { name: 'Update', value: updateInfo.message },
                { name: 'Version', value: updateInfo.latest.substring(0, 7) },
                { name: 'Status', value: '✅ Healthy' },
                { name: 'Restart', value: 'Scheduled in 30 seconds' },
            ],
            timestamp: new Date().toISOString(),
        };

        if (this.client.error) {
            await this.client.error.send({ embeds: [embed] }).catch(() => {});
        }
    }

    /**
     * Notify update failure
     * @param {Error} error - Error that occurred
     * @param {Object} updateInfo - Update information
     */
    async notifyUpdateFailure(error, updateInfo) {
        const embed = {
            title: '❌ Update Failed',
            color: 0xff0000,
            description: `Failed to apply update. Rollback initiated.`,
            fields: [
                { name: 'Update', value: updateInfo.message },
                { name: 'Error', value: error.message.substring(0, 1024) },
                { name: 'Status', value: 'Rolled back to previous version' },
            ],
            timestamp: new Date().toISOString(),
        };

        if (this.client.error) {
            await this.client.error.send({ embeds: [embed] }).catch(() => {});
        }
    }

    /**
     * Stop the auto-updater
     */
    stop() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
            this.client.logger.info('Auto-updater stopped');
        }
    }
}

module.exports = AutoUpdater;
