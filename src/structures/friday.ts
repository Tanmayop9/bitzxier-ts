import { Client, Collection, Partials, WebhookClient } from 'discord.js';
import fs from 'fs';
import Utils from './util';
import Database from './database';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import Sql from 'better-sqlite3';
import { Destroyer } from 'destroyer-fast-cache';
import ErrorHandler from './ErrorHandler';
import ConfigValidator from './ConfigValidator';
import CommandHandler from './CommandHandler';
import PremiumManager from './PremiumManager';
import HealthCheck from './HealthCheck';
import CacheManager from './CacheManager';
import { COLORS, EMOJIS, VERSION } from './constants';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import logger from './logger';
import type { BotConfig } from '../types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

export default class Friday extends Client {
    constructor() {
        super({
            intents: 53608191,
            fetchAllMembers: true,
            shards: getInfo().SHARD_LIST, 
           shardCount: getInfo().TOTAL_SHARDS, 
            allowedMentions: {
        parse: ['users'], 
        repliedUser: true 
            },
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
            sweepers: {
        messages: {
            interval: 300,
            lifetime: 1800
        }} })
        this.setMaxListeners(Infinity);
        this.cluster = new ClusterClient(this);
        // Config will be loaded asynchronously in init
        this.config = {} as BotConfig;
        this.logger = logger;
        this.ready = false;
        this.rateLimits = new Collection();
        this.commands = new Collection();
        this.categories = fs.readdirSync(`${process.cwd()}/dist/commands/`);
        
        // Use constants for emojis and colors
        this.emoji = EMOJIS;
        this.color = COLORS.PRIMARY;
        this.version = VERSION.FULL;

        this.util = new Utils(this);
        this.support = `https://discord.gg/S7Ju9RUpbT`;
        this.cooldowns = new Collection();
        // Initialize webhooks - will be set after config loads
        this.ratelimit = null;
        this.error = null;

        // Initialize modern helper classes
        this.errorHandler = new ErrorHandler(this);
        this.commandHandler = new CommandHandler(this);
        this.premiumManager = new PremiumManager(this);
        this.healthCheck = new HealthCheck(this);
        this.cacheManager = new CacheManager();

        // Use centralized error handler for client errors
        this.on('error', (error) => {
            this.errorHandler.handle(error, { source: 'clientError' });
        });

        // Modern rate limit handler with adaptive backoff
        this.rest.on('rateLimited', (info) => {
            const { route, retryAfter, limit, remaining, resetAfter, timeout } = info;

            // Log to webhook if available
            if (this.ratelimit) {
                const message = [
                    '```js',
                    `Timeout: ${info.retryAfter}`,
                    `Limit: ${info.limit}`,
                    `Method: ${info.method}`,
                    `Route: ${info.route}`,
                    `Global: ${info.global}`,
                    `URL: ${info.url}`,
                    `Scope: ${info.scope}`,
                    '```',
                ].join('\n');
                this.ratelimit.send(message).catch(() => {});
            }

            // Store rate limit info
            this.rateLimits.set(route, {
                timeout,
                limit,
                remaining,
                resetAfter,
                lastReset: Date.now(),
            });

            // Implement adaptive backoff strategy
            const now = Date.now();
            const rateLimit = this.rateLimits.get(route);
            const timeLeft = rateLimit.resetAfter - (now - rateLimit.lastReset);
            const backoffTime = Math.min(Math.max(timeLeft, 1000), 60000);

            // Non-blocking backoff
            setTimeout(() => {
                this.rateLimits.delete(route);
            }, backoffTime);
        });

    }

    async initializedata() {
        this.cache = new Destroyer()
        this.db = new Database()
        await this.db.connect()
        
        // Dynamically import models
        const { default: afkModel } = await import('../models/afk.js');
        const { default: boostModel } = await import('../models/boost.js');
        const { default: guildconfigModel } = await import('../models/guildconfig.js');
        const { default: mainroleModel } = await import('../models/mainrole.js');
        const { default: ticketModel } = await import('../models/ticket.js');
        const { default: autoroleModel } = await import('../models/autorole.js');
        
        // Initialize models with database
        this.models = {
            afk: afkModel(this.db),
            boost: boostModel(this.db),
            guildconfig: guildconfigModel(this.db),
            mainrole: mainroleModel(this.db),
            ticket: ticketModel(this.db)
        }
        
        // Set database for all models to make them globally accessible
        afkModel.setDb(this.db);
        boostModel.setDb(this.db);
        guildconfigModel.setDb(this.db);
        mainroleModel.setDb(this.db);
        ticketModel.setDb(this.db);
        autoroleModel.setDb(this.db);
        
        this.logger.log('JoshDB Database Connected', 'ready')
    }
    async SQL() {
        this.warn = new Sql(`${process.cwd()}/Database/warns.db`);
        this.warn.pragma('journal_mode = WAL');
        this.warn.prepare(`CREATE TABLE IF NOT EXISTS warnings (id INTEGER PRIMARY KEY AUTOINCREMENT,guildId TEXT NOT NULL,userId TEXT NOT NULL,reason TEXT,moderatorId TEXT,timestamp TEXT,warnId TEXT NOT NULL)`).run();
        this.snipe = new Sql(`${process.cwd()}/Database/snipe.db`);
        this.snipe.pragma('journal_mode = WAL');
    this.snipe.pragma('synchronous = NORMAL');

    this.snipe.pragma('locking_mode = NORMAL');
   
    this.snipe.pragma('threads = 4');
        this.snipe.prepare(`CREATE TABLE IF NOT EXISTS snipes (id INTEGER PRIMARY KEY AUTOINCREMENT,guildId TEXT NOT NULL,channelId TEXT NOT NULL,content TEXT,author TEXT,timestamp INTEGER,imageUrl TEXT)`).run();
        this.cmd = new Sql(`${process.cwd()}/Database/cmd.db`);
        this.cmd.pragma('journal_mode = WAL');
        this.cmd.prepare(`
            CREATE TABLE IF NOT EXISTS total_command_count (
                id INTEGER PRIMARY KEY CHECK (id = 1), 
                count INTEGER DEFAULT 0
            )
        `).run();
        this.cmd.prepare(`
            INSERT OR IGNORE INTO total_command_count (id, count) VALUES (1, 0)
        `).run();
    }

    async initializeMongoose() {
        // Mongoose removed - all data now stored in data-sets directory
        this.logger.log('Using JoshDB for all data storage', 'ready')
    }

    async loadEvents() {
        const files = fs.readdirSync(`${process.cwd()}/dist/events/`);
        for (const file of files) {
            const eventName = file.split('.')[0];
            const { default: eventHandler } = await import(`${process.cwd()}/dist/events/${file}`);
            eventHandler(this);
            this.logger.log(`Updated Event ${eventName}.`, 'event');
        }
    }

    async loadlogs() {
        const files = fs.readdirSync(`${process.cwd()}/dist/logs/`);
        for (const file of files) {
            const logevent = file.split('.')[0];
            const { default: logHandler } = await import(`${process.cwd()}/dist/logs/${file}`);
            logHandler(this);
            this.logger.log(`Updated Logs ${logevent}.`, 'event');
        }
    }
        
    async loadMain() {
        const commandFiles = []

        const commandDirectories = fs.readdirSync(`${process.cwd()}/dist/commands`)

        for (const directory of commandDirectories) {
            const files = fs
                .readdirSync(`${process.cwd()}/dist/commands/${directory}`)
                .filter((file) => file.endsWith('.js'))

            for (const file of files) {
                commandFiles.push(
                    `${process.cwd()}/dist/commands/${directory}/${file}`
                )
            }
        }
        
        for (const value of commandFiles) {
            const { default: file } = await import(value);
            const splitted = value.split('/');
            const directory = splitted[splitted.length - 2];
            if (file.name) {
                const properties = { directory, ...file };
                this.commands.set(file.name, properties);
            }
        }
        this.logger.log(`Updated ${this.commands.size} Commands.`, 'cmd')
    }
    
    async loadConfig() {
        const config = await import(`${process.cwd()}/config.json`, {
            with: { type: 'json' }
        }).then(module => module.default);
        this.config = config;
        
        // Validate configuration
        const validation = ConfigValidator.validate(this.config);
        if (!validation.success) {
            console.error('Configuration validation failed:', validation.errors);
            process.exit(1);
        }
        if (validation.warnings.length > 0) {
            console.warn('Configuration warnings:', validation.warnings);
        }
    }
}

