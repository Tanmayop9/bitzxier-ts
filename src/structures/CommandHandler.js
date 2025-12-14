/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Modern command handler with improved organization
 */
import { Collection } from 'discord.js';
class CommandHandler {
    constructor(client) {
        this.client = client;
        this.cooldownCache = new Collection();
    }
    /**
     * Check if user is blacklisted
     * @param {string} userId - User ID to check
     * @returns {boolean}
     */
    isBlacklisted(userId) {
        const blacklist = this.client.blacklist || [];
        return blacklist.includes(userId) && !this.client.config.owner.includes(userId);
    }
    /**
     * Check if command is premium only
     * @param {Object} command - Command object
     * @param {Object} message - Message object
     * @returns {Object} Check result
     */
    async checkPremium(command, message) {
        if (!command.premium) {
            return { allowed: true };
        }
        const uprem = await this.client.db.get(`uprem_${message.author.id}`);
        const sprem = await this.client.db.get(`sprem_${message.guild.id}`);
        if (this.client.config.owner.includes(message.author.id) || uprem || sprem) {
            return { allowed: true };
        }
        return {
            allowed: false,
            reason: 'premium_required',
        };
    }
    /**
     * Check if channel is ignored
     * @param {Object} message - Message object
     * @returns {boolean}
     */
    async isChannelIgnored(message) {
        if (this.client.config.owner.includes(message.author.id)) {
            return false;
        }
        const ignore = (await this.client.db?.get(`ignore_${message.guild.id}`)) ?? {
            channel: [],
            role: [],
        };
        const isIgnored = ignore.channel.includes(message.channel.id);
        const hasWhitelistedRole = message.member.roles.cache.some((role) => ignore.role.includes(role.id));
        return isIgnored && !hasWhitelistedRole;
    }
    /**
     * Check maintenance mode
     * @param {Object} message - Message object
     * @returns {boolean}
     */
    async isInMaintenance(message) {
        const maintain = await this.client.db.get(`maintanance_${this.client.user.id}`);
        return maintain && !this.client.config.admin.includes(message.author.id);
    }
    /**
     * Handle command cooldown
     * @param {Object} command - Command object
     * @param {Object} message - Message object
     * @returns {Object} Cooldown check result
     */
    handleCooldown(command, message) {
        if (!this.client.config.cooldown || this.client.config.owner.includes(message.author.id)) {
            return { allowed: true };
        }
        if (!this.client.cooldowns.has(command.name)) {
            this.client.cooldowns.set(command.name, new Collection());
        }
        const now = Date.now();
        const timestamps = this.client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 5) * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                let commandCount = timestamps.get(`${message.author.id}_count`) || 0;
                commandCount++;
                timestamps.set(`${message.author.id}_count`, commandCount);
                // Check for spam (more than 5 attempts)
                if (commandCount > 5) {
                    return {
                        allowed: false,
                        reason: 'spam',
                        timeLeft,
                    };
                }
                // Show cooldown message only once
                if (!timestamps.has(`${message.author.id}_cooldown_message_sent`)) {
                    timestamps.set(`${message.author.id}_cooldown_message_sent`, true);
                    return {
                        allowed: false,
                        reason: 'cooldown',
                        timeLeft,
                        showMessage: true,
                    };
                }
                return {
                    allowed: false,
                    reason: 'cooldown',
                    timeLeft,
                    showMessage: false,
                };
            }
        }
        timestamps.set(message.author.id, now);
        timestamps.set(`${message.author.id}_count`, 1);
        setTimeout(() => {
            timestamps.delete(message.author.id);
            timestamps.delete(`${message.author.id}_count`);
            timestamps.delete(`${message.author.id}_cooldown_message_sent`);
        }, cooldownAmount);
        return { allowed: true };
    }
    /**
     * Blacklist user for spam
     * @param {string} userId - User ID to blacklist
     */
    async blacklistUser(userId) {
        let blacklistedUsers = (await this.client.db.get(`blacklist_${this.client.user.id}`)) || [];
        if (!blacklistedUsers.includes(userId)) {
            blacklistedUsers.push(userId);
            await this.client.db.set(`blacklist_${this.client.user.id}`, blacklistedUsers);
            this.client.util.blacklist();
        }
    }
    /**
     * Increment command counter
     */
    incrementCommandCount() {
        if (this.client.cmd) {
            this.client.cmd
                .prepare('UPDATE total_command_count SET count = count + 1 WHERE id = 1')
                .run();
        }
    }
}
export default CommandHandler;
//# sourceMappingURL=CommandHandler.js.map