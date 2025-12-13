/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Command scheduler for automatic enable/disable on schedule
 */

const cron = require('node-cron');

class CommandScheduler {
    constructor(client) {
        this.client = client;
        this.schedules = new Map();
        this.disabledCommands = new Set();
        this.scheduledTasks = new Map();
    }

    /**
     * Initialize command scheduler
     */
    async initialize() {
        await this.loadDisabledCommands();
        await this.loadSchedules();
        this.client.logger.info('Command scheduler initialized');
    }

    /**
     * Load disabled commands from database
     */
    async loadDisabledCommands() {
        try {
            const disabled = await this.client.db.get('disabled_commands') || [];
            disabled.forEach(cmd => this.disabledCommands.add(cmd));
            this.client.logger.debug(`Loaded ${this.disabledCommands.size} disabled commands`);
        } catch (error) {
            this.client.logger.warn('Failed to load disabled commands');
        }
    }

    /**
     * Load command schedules from database
     */
    async loadSchedules() {
        try {
            const schedules = await this.client.db.get('command_schedules') || {};
            
            for (const [commandName, schedule] of Object.entries(schedules)) {
                this.schedules.set(commandName, schedule);
                
                if (schedule.enabled) {
                    this.startSchedule(commandName, schedule);
                }
            }
            
            this.client.logger.debug(`Loaded ${this.schedules.size} command schedules`);
        } catch (error) {
            this.client.logger.warn('Failed to load command schedules');
        }
    }

    /**
     * Check if command is currently disabled
     * @param {string} commandName - Command name
     * @returns {boolean}
     */
    isCommandDisabled(commandName) {
        return this.disabledCommands.has(commandName);
    }

    /**
     * Check if command is available (not disabled)
     * @param {string} commandName - Command name
     * @returns {boolean}
     */
    isCommandAvailable(commandName) {
        return !this.disabledCommands.has(commandName);
    }

    /**
     * Disable a command
     * @param {string} commandName - Command name
     * @param {string} reason - Reason for disabling
     */
    async disableCommand(commandName, reason = 'Manual disable') {
        this.disabledCommands.add(commandName);
        await this.saveDisabledCommands();
        
        this.client.logger.info(`Command "${commandName}" disabled: ${reason}`);
        
        // Send notification
        await this.notifyCommandStatusChange(commandName, false, reason);
    }

    /**
     * Enable a command
     * @param {string} commandName - Command name
     * @param {string} reason - Reason for enabling
     */
    async enableCommand(commandName, reason = 'Manual enable') {
        this.disabledCommands.delete(commandName);
        await this.saveDisabledCommands();
        
        this.client.logger.info(`Command "${commandName}" enabled: ${reason}`);
        
        // Send notification
        await this.notifyCommandStatusChange(commandName, true, reason);
    }

    /**
     * Create or update a command schedule
     * @param {string} commandName - Command name
     * @param {Object} scheduleConfig - Schedule configuration
     */
    async createSchedule(commandName, scheduleConfig) {
        const schedule = {
            enabled: scheduleConfig.enabled ?? true,
            enableCron: scheduleConfig.enableCron, // e.g., "0 0 * * 6" for Saturday midnight
            disableCron: scheduleConfig.disableCron, // e.g., "0 0 * * 0" for Sunday midnight
            timezone: scheduleConfig.timezone || 'UTC',
            description: scheduleConfig.description || 'No description',
        };

        // Validate cron expressions
        if (!this.validateCron(schedule.enableCron) || !this.validateCron(schedule.disableCron)) {
            throw new Error('Invalid cron expression');
        }

        this.schedules.set(commandName, schedule);
        await this.saveSchedules();

        // Start the schedule if enabled
        if (schedule.enabled) {
            this.startSchedule(commandName, schedule);
        }

        this.client.logger.info(`Schedule created for command "${commandName}"`);
        return schedule;
    }

    /**
     * Validate cron expression
     * @param {string} cronExpr - Cron expression
     * @returns {boolean}
     */
    validateCron(cronExpr) {
        try {
            return cron.validate(cronExpr);
        } catch (error) {
            return false;
        }
    }

    /**
     * Start a command schedule
     * @param {string} commandName - Command name
     * @param {Object} schedule - Schedule configuration
     */
    startSchedule(commandName, schedule) {
        // Stop existing schedule if any
        this.stopSchedule(commandName);

        const tasks = [];

        // Schedule enable
        if (schedule.enableCron) {
            const enableTask = cron.schedule(
                schedule.enableCron,
                async () => {
                    await this.enableCommand(commandName, 'Scheduled enable');
                },
                {
                    scheduled: true,
                    timezone: schedule.timezone,
                }
            );
            tasks.push({ type: 'enable', task: enableTask });
        }

        // Schedule disable
        if (schedule.disableCron) {
            const disableTask = cron.schedule(
                schedule.disableCron,
                async () => {
                    await this.disableCommand(commandName, 'Scheduled disable');
                },
                {
                    scheduled: true,
                    timezone: schedule.timezone,
                }
            );
            tasks.push({ type: 'disable', task: disableTask });
        }

        this.scheduledTasks.set(commandName, tasks);
        this.client.logger.debug(`Started schedule for command "${commandName}"`);
    }

    /**
     * Stop a command schedule
     * @param {string} commandName - Command name
     */
    stopSchedule(commandName) {
        const tasks = this.scheduledTasks.get(commandName);
        if (tasks) {
            tasks.forEach(({ task }) => task.stop());
            this.scheduledTasks.delete(commandName);
            this.client.logger.debug(`Stopped schedule for command "${commandName}"`);
        }
    }

    /**
     * Remove a schedule
     * @param {string} commandName - Command name
     */
    async removeSchedule(commandName) {
        this.stopSchedule(commandName);
        this.schedules.delete(commandName);
        await this.saveSchedules();
        this.client.logger.info(`Removed schedule for command "${commandName}"`);
    }

    /**
     * Get all disabled commands
     * @returns {string[]}
     */
    getDisabledCommands() {
        return Array.from(this.disabledCommands);
    }

    /**
     * Get all scheduled commands
     * @returns {Object[]}
     */
    getScheduledCommands() {
        return Array.from(this.schedules.entries()).map(([name, schedule]) => ({
            name,
            ...schedule,
            active: this.scheduledTasks.has(name),
        }));
    }

    /**
     * Get schedule for a command
     * @param {string} commandName - Command name
     * @returns {Object|null}
     */
    getSchedule(commandName) {
        return this.schedules.get(commandName) || null;
    }

    /**
     * Save disabled commands to database
     */
    async saveDisabledCommands() {
        try {
            const disabled = Array.from(this.disabledCommands);
            await this.client.db.set('disabled_commands', disabled);
        } catch (error) {
            this.client.logger.error('Failed to save disabled commands:', error.message);
        }
    }

    /**
     * Save schedules to database
     */
    async saveSchedules() {
        try {
            const schedules = Object.fromEntries(this.schedules);
            await this.client.db.set('command_schedules', schedules);
        } catch (error) {
            this.client.logger.error('Failed to save schedules:', error.message);
        }
    }

    /**
     * Notify command status change
     * @param {string} commandName - Command name
     * @param {boolean} enabled - New status
     * @param {string} reason - Reason for change
     */
    async notifyCommandStatusChange(commandName, enabled, reason) {
        if (!this.client.error) return;

        const embed = {
            title: `🔧 Command ${enabled ? 'Enabled' : 'Disabled'}`,
            color: enabled ? 0x00ff00 : 0xff0000,
            description: `Command \`${commandName}\` has been ${enabled ? 'enabled' : 'disabled'}`,
            fields: [
                { name: 'Reason', value: reason },
                { name: 'Status', value: enabled ? '✅ Available' : '❌ Unavailable' },
                { name: 'Time', value: new Date().toLocaleString() },
            ],
            timestamp: new Date().toISOString(),
        };

        await this.client.error.send({ embeds: [embed] }).catch(() => {});
    }

    /**
     * Get status report
     * @returns {Object}
     */
    getStatusReport() {
        return {
            totalDisabled: this.disabledCommands.size,
            totalSchedules: this.schedules.size,
            activeSchedules: this.scheduledTasks.size,
            disabledCommands: this.getDisabledCommands(),
            scheduledCommands: this.getScheduledCommands(),
        };
    }

    /**
     * Stop all schedules
     */
    stopAll() {
        for (const [commandName] of this.scheduledTasks) {
            this.stopSchedule(commandName);
        }
        this.client.logger.info('All command schedules stopped');
    }
}

module.exports = CommandScheduler;
