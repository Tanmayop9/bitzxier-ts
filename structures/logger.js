const chalk = require('chalk');
const moment = require('moment');

/**
 * Modern logger with structured logging and log levels
 */
module.exports = class Logger {
    static logLevel = process.env.LOG_LEVEL || 'info';
    static levels = {
        error: 0,
        warn: 1,
        info: 2,
        ready: 2,
        event: 3,
        cmd: 3,
        debug: 4,
        shard: 3,
    };

    static shouldLog(type) {
        const currentLevel = this.levels[this.logLevel] ?? this.levels.info;
        const messageLevel = this.levels[type] ?? this.levels.info;
        return messageLevel <= currentLevel;
    }

    static log(content, type = 'log') {
        // Check if we should log this level
        if (!this.shouldLog(type)) {
            return;
        }

        const timestamp = `[${moment().utcOffset('+05:30').format('DD.MM.yyyy hh:mmA')}]:`;

        const logConfig = {
            log: { color: chalk.bgBlue, label: 'LOG' },
            warn: { color: chalk.black.bgYellow, label: 'WARN' },
            error: { color: chalk.bgRed, label: 'ERROR' },
            debug: { color: chalk.green, label: 'DEBUG' },
            event: { color: chalk.black.bgWhite, label: 'EVENT' },
            cmd: { color: chalk.black.bgWhite, label: 'CMD' },
            ready: { color: chalk.black.bgGreen, label: 'READY' },
            shard: { color: chalk.black.bgGreen, label: 'SHARD' },
            info: { color: chalk.bgCyan, label: 'INFO' },
        };

        const config = logConfig[type] || logConfig.log;
        console.log(`${timestamp} ${config.color(config.label)} ${content}`);
    }

    static error(content) {
        return this.log(content, 'error');
    }

    static warn(content) {
        return this.log(content, 'warn');
    }

    static debug(content) {
        return this.log(content, 'debug');
    }

    static cmd(content) {
        return this.log(content, 'cmd');
    }

    static info(content) {
        return this.log(content, 'info');
    }

    static event(content) {
        return this.log(content, 'event');
    }

    static ready(content) {
        return this.log(content, 'ready');
    }
}
