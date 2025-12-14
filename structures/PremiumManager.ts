/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Premium subscription manager
 */

class PremiumManager {
    constructor(client) {
        this.client = client;
    }

    /**
     * Check if user has premium
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Premium status
     */
    async checkUserPremium(userId) {
        const uprem = await this.client.db.get(`uprem_${userId}`);
        const upremend = await this.client.db.get(`upremend_${userId}`);

        if (!uprem || !upremend) {
            return { hasPremium: false };
        }

        // Check if expired
        if (Date.now() >= upremend) {
            return { hasPremium: false, expired: true };
        }

        return { hasPremium: true, expiresAt: upremend };
    }

    /**
     * Check if server has premium
     * @param {string} guildId - Guild ID
     * @returns {Promise<Object>} Premium status
     */
    async checkServerPremium(guildId) {
        const sprem = await this.client.db.get(`sprem_${guildId}`);
        const spremend = await this.client.db.get(`spremend_${guildId}`);

        if (!sprem || !spremend) {
            return { hasPremium: false };
        }

        // Check if expired
        if (Date.now() >= spremend) {
            return { hasPremium: false, expired: true };
        }

        return { hasPremium: true, expiresAt: spremend };
    }

    /**
     * Handle expired user premium
     * @param {string} userId - User ID
     */
    async handleExpiredUserPremium(userId) {
        const upremserver =
            (await this.client.db.get(`upremserver_${userId}`)) || [];

        let removedServers = 0;
        for (const serverId of upremserver) {
            await this.client.db.delete(`sprem_${serverId}`);
            await this.client.db.delete(`spremend_${serverId}`);
            await this.client.db.delete(`spremown_${serverId}`);
            removedServers++;
        }

        await this.client.db.delete(`upremcount_${userId}`);
        await this.client.db.delete(`uprem_${userId}`);
        await this.client.db.delete(`upremend_${userId}`);
        await this.client.db.delete(`upremserver_${userId}`);
        await this.client.db.pull(`noprefix_${this.client.user.id}`, userId);

        return { removedServers };
    }

    /**
     * Handle expired server premium
     * @param {string} guildId - Guild ID
     */
    async handleExpiredServerPremium(guildId) {
        const ownerId = await this.client.db.get(`spremown_${guildId}`);

        await this.client.db.delete(`sprem_${guildId}`);
        await this.client.db.delete(`spremend_${guildId}`);
        await this.client.db.delete(`spremown_${guildId}`);

        // Check if owner's user premium also expired
        if (ownerId) {
            const ownerPremiumEnd = await this.client.db.get(`upremend_${ownerId}`);
            if (ownerPremiumEnd && Date.now() >= ownerPremiumEnd) {
                await this.handleExpiredUserPremium(ownerId);
            }
        }

        return { ownerId };
    }

    /**
     * Check if command requires premium and validate
     * @param {Object} command - Command object
     * @param {Object} message - Message object
     * @returns {Promise<Object>} Validation result
     */
    async validateCommandPremium(command, message) {
        if (!command.premium) {
            return { allowed: true };
        }

        // Owners bypass premium check
        if (this.client.config.owner.includes(message.author.id)) {
            return { allowed: true };
        }

        const userPremium = await this.checkUserPremium(message.author.id);
        const serverPremium = await this.checkServerPremium(message.guild.id);

        if (userPremium.hasPremium || serverPremium.hasPremium) {
            return { allowed: true };
        }

        return {
            allowed: false,
            reason: 'premium_required',
            userExpired: userPremium.expired,
            serverExpired: serverPremium.expired,
        };
    }
}

export default PremiumManager;
