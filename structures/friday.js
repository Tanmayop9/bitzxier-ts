const { Client, Collection, Partials, WebhookClient } = require('discord.js');
const fs = require('fs');
const Utils = require('./util');
const Database = require('./database');
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
const Sql = require('better-sqlite3');
const { Destroyer } = require('destroyer-fast-cache');
const { ErrorHandler } = require('./ErrorHandler');
const ConfigValidator = require('./ConfigValidator');
const CommandHandler = require('./CommandHandler');
const PremiumManager = require('./PremiumManager');
const HealthCheck = require('./HealthCheck');
const CacheManager = require('./CacheManager');
const { COLORS, EMOJIS, VERSION } = require('./constants');
module.exports = class Friday extends Client {
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
        this.setMaxListeners(Infinity)
       this.cluster = new ClusterClient(this);
        this.config = require(`${process.cwd()}/config.json`)
        this.logger = require('./logger')
        this.ready = false;
        this.rateLimits = new Collection();
        this.commands = new Collection();
        this.categories = fs.readdirSync('./commands/');
        
        // Use constants for emojis and colors
        this.emoji = EMOJIS;
        this.color = COLORS.PRIMARY;
        this.version = VERSION.FULL;

        this.util = new Utils(this);
        this.support = `https://discord.gg/S7Ju9RUpbT`
        this.cooldowns = new Collection()
        // Initialize webhooks only if URLs are provided in config
        this.ratelimit = this.config.RATELIMIT_WEBHOOK_URL
            ? new WebhookClient({ url: this.config.RATELIMIT_WEBHOOK_URL })
            : null;
        this.error = this.config.ERROR_WEBHOOK_URL
            ? new WebhookClient({ url: this.config.ERROR_WEBHOOK_URL })
            : null;

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
        
        // Initialize models with database
        this.models = {
            afk: require('../models/afk')(this.db),
            boost: require('../models/boost')(this.db),
            guildconfig: require('../models/guildconfig')(this.db),
            mainrole: require('../models/mainrole')(this.db),
            ticket: require('../models/ticket')(this.db)
        }
        
        // Set database for all models to make them globally accessible
        require('../models/afk').setDb(this.db);
        require('../models/boost').setDb(this.db);
        require('../models/guildconfig').setDb(this.db);
        require('../models/mainrole').setDb(this.db);
        require('../models/ticket').setDb(this.db);
        require('../models/autorole').setDb(this.db);
        
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
        fs.readdirSync('./events/').forEach((file) => {
            let eventName = file.split('.')[0]
            require(`${process.cwd()}/events/${file}`)(this)
            this.logger.log(`Updated Event ${eventName}.`, 'event')
        })
    }

    async loadlogs() {
        fs.readdirSync('./logs/').forEach((file) => {
            let logevent = file.split('.')[0]
            require(`${process.cwd()}/logs/${file}`)(this)
            this.logger.log(`Updated Logs ${logevent}.`, 'event')
        })
    }
        
    async loadMain() {
        const commandFiles = []

        const commandDirectories = fs.readdirSync(`${process.cwd()}/commands`)

        for (const directory of commandDirectories) {
            const files = fs
                .readdirSync(`${process.cwd()}/commands/${directory}`)
                .filter((file) => file.endsWith('.js'))

            for (const file of files) {
                commandFiles.push(
                    `${process.cwd()}/commands/${directory}/${file}`
                )
            }
        }
        commandFiles.map((value) => {
            const file = require(value)
            const splitted = value.split('/')
            const directory = splitted[splitted.length - 2]
            if (file.name) {
                const properties = { directory, ...file }
                this.commands.set(file.name, properties)
            }
        })
        this.logger.log(`Updated ${this.commands.size} Commands.`, 'cmd')
    }
}

