/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Announcement manager for update notifications and feature announcements
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class AnnouncementManager {
    constructor(client) {
        this.client = client;
        this.updateHistory = [];
        this.sneakPeeks = new Map();
    }

    /**
     * Initialize announcement manager
     */
    async initialize() {
        await this.loadUpdateHistory();
        await this.loadSneakPeeks();
        this.client.logger.info('Announcement manager initialized');
    }

    /**
     * Load update history from database
     */
    async loadUpdateHistory() {
        try {
            const history = await this.client.db.get('update_history') || [];
            this.updateHistory = history;
            this.client.logger.debug(`Loaded ${this.updateHistory.length} update records`);
        } catch (error) {
            this.client.logger.warn('Failed to load update history');
        }
    }

    /**
     * Load sneak peeks from database
     */
    async loadSneakPeeks() {
        try {
            const peeks = await this.client.db.get('sneak_peeks') || {};
            this.sneakPeeks = new Map(Object.entries(peeks));
            this.client.logger.debug(`Loaded ${this.sneakPeeks.size} sneak peeks`);
        } catch (error) {
            this.client.logger.warn('Failed to load sneak peeks');
        }
    }

    /**
     * Parse commit message to extract features/commands
     * @param {string} message - Commit message
     * @returns {Object} Parsed information
     */
    parseCommitMessage(message) {
        const lines = message.split('\n').filter(line => line.trim());
        const features = [];
        const commands = [];
        const fixes = [];
        const improvements = [];

        lines.forEach(line => {
            const lower = line.toLowerCase();
            
            if (lower.includes('add') && lower.includes('command')) {
                commands.push(line.replace(/^[-*•]\s*/, '').trim());
            } else if (lower.includes('add') || lower.includes('new')) {
                features.push(line.replace(/^[-*•]\s*/, '').trim());
            } else if (lower.includes('fix')) {
                fixes.push(line.replace(/^[-*•]\s*/, '').trim());
            } else if (lower.includes('improve') || lower.includes('update')) {
                improvements.push(line.replace(/^[-*•]\s*/, '').trim());
            }
        });

        return {
            title: lines[0] || 'Update',
            features,
            commands,
            fixes,
            improvements
        };
    }

    /**
     * Create update announcement embed
     * @param {Object} updateInfo - Update information
     * @returns {Object} Discord embed
     */
    createUpdateAnnouncement(updateInfo) {
        const parsed = this.parseCommitMessage(updateInfo.message);
        const version = updateInfo.version || this.client.version;
        const sneakPeek = this.getNextSneakPeek();

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`🎉 ${this.client.user.username} Updated to v${version}!`)
            .setDescription(parsed.title)
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        // Add new commands
        if (parsed.commands.length > 0) {
            embed.addFields({
                name: '📝 New Commands Added',
                value: parsed.commands.map(cmd => `• ${cmd}`).join('\n') || 'No new commands',
            });
        }

        // Add new features
        if (parsed.features.length > 0) {
            embed.addFields({
                name: '✨ New Features',
                value: parsed.features.map(feat => `• ${feat}`).join('\n'),
            });
        }

        // Add improvements
        if (parsed.improvements.length > 0) {
            embed.addFields({
                name: '⚡ Improvements',
                value: parsed.improvements.map(imp => `• ${imp}`).join('\n'),
            });
        }

        // Add bug fixes
        if (parsed.fixes.length > 0) {
            embed.addFields({
                name: '🐛 Bug Fixes',
                value: parsed.fixes.map(fix => `• ${fix}`).join('\n'),
            });
        }

        // Add sneak peek if available
        if (sneakPeek) {
            embed.addFields({
                name: '👀 Sneak Peek - Coming Next Update',
                value: `🔜 **${sneakPeek.name}** - ${sneakPeek.description}`,
            });
        }

        embed.setFooter({
            text: `Updated by: ${updateInfo.author || 'System'} | ${this.client.support}`,
            iconURL: this.client.user.displayAvatarURL(),
        });

        return embed;
    }

    /**
     * Get next sneak peek command
     * @returns {Object|null} Sneak peek information
     */
    getNextSneakPeek() {
        const peeks = Array.from(this.sneakPeeks.values()).filter(peek => !peek.released);
        if (peeks.length === 0) return null;
        
        // Return random sneak peek or the first one
        return peeks[Math.floor(Math.random() * peeks.length)];
    }

    /**
     * Add a sneak peek for future feature
     * @param {string} id - Unique ID for sneak peek
     * @param {string} name - Command/feature name
     * @param {string} description - Description
     */
    async addSneakPeek(id, name, description) {
        this.sneakPeeks.set(id, {
            name,
            description,
            released: false,
            addedAt: new Date().toISOString(),
        });
        await this.saveSneakPeeks();
        this.client.logger.info(`Added sneak peek: ${name}`);
    }

    /**
     * Mark sneak peek as released
     * @param {string} id - Sneak peek ID
     */
    async markSneakPeekReleased(id) {
        const peek = this.sneakPeeks.get(id);
        if (peek) {
            peek.released = true;
            peek.releasedAt = new Date().toISOString();
            await this.saveSneakPeeks();
            this.client.logger.info(`Marked sneak peek as released: ${peek.name}`);
        }
    }

    /**
     * Send announcement to all configured notice channels
     * @param {Object} updateInfo - Update information
     */
    async announceUpdate(updateInfo) {
        const embed = this.createUpdateAnnouncement(updateInfo);
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL(this.client.support),
            new ButtonBuilder()
                .setLabel('Changelog')
                .setStyle(ButtonStyle.Link)
                .setURL(updateInfo.url || this.client.support)
        );

        let successCount = 0;
        let failCount = 0;

        // First, announce in support server if configured
        const supportGuildId = await this.client.db.get('support_guild_id');
        const supportChannelId = await this.client.db.get('support_announcement_channel');
        
        if (supportGuildId && supportChannelId) {
            try {
                const supportGuild = this.client.guilds.cache.get(supportGuildId);
                if (supportGuild) {
                    const supportChannel = supportGuild.channels.cache.get(supportChannelId);
                    if (supportChannel && supportChannel.isTextBased()) {
                        await supportChannel.send({
                            content: '@everyone 🎊 **Bot Update Released!**',
                            embeds: [embed],
                            components: [row],
                        });
                        this.client.logger.info('✅ Update announced in support server');
                    }
                }
            } catch (error) {
                this.client.logger.error('Failed to announce in support server:', error.message);
            }
        }

        // Then announce to all guilds with configured notice channels
        for (const guild of this.client.guilds.cache.values()) {
            try {
                const noticeChannelId = await this.client.db.get(`notice_channel_${guild.id}`);
                
                if (noticeChannelId) {
                    const channel = guild.channels.cache.get(noticeChannelId);
                    
                    if (channel && channel.isTextBased()) {
                        await channel.send({
                            content: '🎊 **Bot Update Announcement!**',
                            embeds: [embed],
                            components: [row],
                        });
                        successCount++;
                        // Add delay to prevent rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (error) {
                failCount++;
                this.client.logger.debug(`Failed to announce in guild ${guild.id}: ${error.message}`);
            }
        }

        // Record announcement
        await this.recordUpdate(updateInfo, successCount);

        this.client.logger.info(
            `Update announced to ${successCount} servers (${failCount} failed)`
        );

        return { successCount, failCount };
    }

    /**
     * Record update in history
     * @param {Object} updateInfo - Update information
     * @param {number} announcementCount - Number of servers announced to
     */
    async recordUpdate(updateInfo, announcementCount) {
        const record = {
            version: updateInfo.version || this.client.version,
            message: updateInfo.message,
            author: updateInfo.author,
            date: updateInfo.date || new Date().toISOString(),
            commit: updateInfo.latest,
            announcementCount,
        };

        this.updateHistory.push(record);
        
        // Keep only last 50 updates
        if (this.updateHistory.length > 50) {
            this.updateHistory = this.updateHistory.slice(-50);
        }

        await this.saveUpdateHistory();
    }

    /**
     * Send custom announcement
     * @param {string} title - Announcement title
     * @param {string} description - Announcement description
     * @param {Object} options - Additional options
     */
    async sendCustomAnnouncement(title, description, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || 0x5865f2)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.image) {
            embed.setImage(options.image);
        }

        embed.setFooter({
            text: `${this.client.user.username} | ${this.client.support}`,
            iconURL: this.client.user.displayAvatarURL(),
        });

        let successCount = 0;

        for (const guild of this.client.guilds.cache.values()) {
            try {
                const noticeChannelId = await this.client.db.get(`notice_channel_${guild.id}`);
                
                if (noticeChannelId) {
                    const channel = guild.channels.cache.get(noticeChannelId);
                    
                    if (channel && channel.isTextBased()) {
                        await channel.send({
                            content: options.mention ? '@everyone' : undefined,
                            embeds: [embed],
                        });
                        successCount++;
                    }
                }
            } catch (error) {
                this.client.logger.debug(`Failed to send announcement to guild ${guild.id}`);
            }
        }

        this.client.logger.info(`Custom announcement sent to ${successCount} servers`);
        return successCount;
    }

    /**
     * Set notice channel for a guild
     * @param {string} guildId - Guild ID
     * @param {string} channelId - Channel ID
     */
    async setNoticeChannel(guildId, channelId) {
        await this.client.db.set(`notice_channel_${guildId}`, channelId);
        this.client.logger.info(`Notice channel set for guild ${guildId}: ${channelId}`);
    }

    /**
     * Get notice channel for a guild
     * @param {string} guildId - Guild ID
     * @returns {Promise<string|null>} Channel ID
     */
    async getNoticeChannel(guildId) {
        return await this.client.db.get(`notice_channel_${guildId}`);
    }

    /**
     * Save update history
     */
    async saveUpdateHistory() {
        try {
            await this.client.db.set('update_history', this.updateHistory);
        } catch (error) {
            this.client.logger.error('Failed to save update history:', error.message);
        }
    }

    /**
     * Save sneak peeks
     */
    async saveSneakPeeks() {
        try {
            const peeks = Object.fromEntries(this.sneakPeeks);
            await this.client.db.set('sneak_peeks', peeks);
        } catch (error) {
            this.client.logger.error('Failed to save sneak peeks:', error.message);
        }
    }

    /**
     * Get update history
     * @param {number} limit - Number of records to return
     * @returns {Object[]} Update history
     */
    getUpdateHistory(limit = 10) {
        return this.updateHistory.slice(-limit).reverse();
    }

    /**
     * Get all sneak peeks
     * @returns {Object[]} Sneak peeks
     */
    getAllSneakPeeks() {
        return Array.from(this.sneakPeeks.entries()).map(([id, peek]) => ({
            id,
            ...peek,
        }));
    }
}

module.exports = AnnouncementManager;
