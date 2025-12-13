/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Base command class for all commands
 */

/**
 * Base class for all bot commands
 * @class BaseCommand
 */
class BaseCommand {
    /**
     * Create a new command
     * @param {Object} options - Command options
     * @param {string} [options.name='unknown'] - Command name
     * @param {string[]} [options.aliases=[]] - Command aliases
     * @param {string} [options.category='misc'] - Command category
     * @param {string} [options.description='No description provided'] - Command description
     * @param {string} [options.usage=''] - Command usage syntax
     * @param {string[]} [options.examples=[]] - Usage examples
     * @param {number} [options.cooldown=3] - Cooldown in seconds
     * @param {boolean} [options.premium=false] - Premium only command
     * @param {boolean} [options.ownerOnly=false] - Owner only command
     * @param {boolean} [options.guildOnly=true] - Guild only command
     * @param {string[]} [options.userPermissions=[]] - Required user permissions
     * @param {string[]} [options.botPermissions=[]] - Required bot permissions
     */
    constructor(options = {}) {
        this.name = options.name || 'unknown';
        this.aliases = options.aliases || [];
        this.category = options.category || 'misc';
        this.description = options.description || 'No description provided';
        this.usage = options.usage || '';
        this.examples = options.examples || [];
        this.cooldown = options.cooldown || 3;
        this.premium = options.premium || false;
        this.ownerOnly = options.ownerOnly || false;
        this.guildOnly = options.guildOnly || true;
        this.permissions = {
            user: options.userPermissions || [],
            bot: options.botPermissions || [],
        };
    }

    /**
     * Check if user has required permissions
     */
    hasPermissions(message) {
        if (this.permissions.user.length > 0) {
            if (!message.member.permissions.has(this.permissions.user)) {
                return { success: false, missing: this.permissions.user };
            }
        }
        return { success: true };
    }

    /**
     * Check if bot has required permissions
     */
    hasBotPermissions(message) {
        if (this.permissions.bot.length > 0) {
            if (!message.guild.members.me.permissions.has(this.permissions.bot)) {
                return { success: false, missing: this.permissions.bot };
            }
        }
        return { success: true };
    }

    /**
     * Create standardized error embed
     */
    createErrorEmbed(client, title, description) {
        return client.util.embed()
            .setColor('#FF0000')
            .setAuthor({ name: title, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${client.emoji.cross} ${description}`)
            .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
            .setTimestamp();
    }

    /**
     * Create standardized success embed
     */
    createSuccessEmbed(client, title, description) {
        return client.util.embed()
            .setColor(client.color)
            .setAuthor({ name: title, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${client.emoji.tick} ${description}`)
            .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
            .setTimestamp();
    }

    /**
     * Create standardized info embed
     */
    createInfoEmbed(client, title, description) {
        return client.util.embed()
            .setColor(client.color)
            .setAuthor({ name: title, iconURL: client.user.displayAvatarURL() })
            .setDescription(description)
            .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
            .setTimestamp();
    }

    /**
     * Execute the command - to be overridden by child classes
     */
    async execute(client, message, args) {
        throw new Error(`Command ${this.name} doesn't have an execute method!`);
    }

    /**
     * Main run method with built-in checks
     */
    async run(client, message, args) {
        // Owner only check
        if (this.ownerOnly && !client.config.owner.includes(message.author.id)) {
            return;
        }

        // Guild only check
        if (this.guildOnly && !message.guild) {
            return message.channel.send({
                embeds: [this.createErrorEmbed(client, 'Guild Only', 'This command can only be used in servers')]
            });
        }

        // User permissions check
        const userPerms = this.hasPermissions(message);
        if (!userPerms.success) {
            return message.channel.send({
                embeds: [this.createErrorEmbed(
                    client,
                    'Missing Permissions',
                    `You need the following permissions: ${userPerms.missing.join(', ')}`
                )]
            });
        }

        // Bot permissions check
        const botPerms = this.hasBotPermissions(message);
        if (!botPerms.success) {
            return message.channel.send({
                embeds: [this.createErrorEmbed(
                    client,
                    'Missing Bot Permissions',
                    `I need the following permissions: ${botPerms.missing.join(', ')}`
                )]
            });
        }

        // Execute command
        try {
            await this.execute(client, message, args);
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.channel.send({
                embeds: [this.createErrorEmbed(
                    client,
                    'Command Error',
                    'An error occurred while executing this command'
                )]
            });
        }
    }
}

module.exports = BaseCommand;
