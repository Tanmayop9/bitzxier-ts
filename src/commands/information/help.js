/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Modern help command with improved UI
 */
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
export default {
    name: 'help',
    aliases: ['h', 'commands'],
    category: 'info',
    cooldown: 5,
    premium: false,
    description: 'Display all available commands',
    run: async (client, message, args) => {
        const prefix = message.guild?.prefix || '&';
        // Modern StringSelectMenu with Components V2
        const selectMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('📚 Select a category to view commands')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
            {
                label: 'Security',
                description: 'AntiNuke & Protection commands',
                value: 'antinuke',
                emoji: '🛡️'
            },
            {
                label: 'Moderation',
                description: 'Server moderation tools',
                value: 'moderation',
                emoji: '⚖️'
            },
            {
                label: 'Automod',
                description: 'Automated moderation features',
                value: 'automod',
                emoji: '🤖'
            },
            {
                label: 'Logging',
                description: 'Server activity logs',
                value: 'logger',
                emoji: '📝'
            },
            {
                label: 'Utility',
                description: 'Helpful utility commands',
                value: 'utility',
                emoji: '🔧'
            },
            {
                label: 'Voice',
                description: 'Voice channel management',
                value: 'voice',
                emoji: '🎤'
            },
            {
                label: 'Join To Create',
                description: 'Temporary voice channels',
                value: 'jointocreate',
                emoji: '➕'
            },
            {
                label: 'Custom Role',
                description: 'Custom role management',
                value: 'customrole',
                emoji: '🎨'
            },
            {
                label: 'Welcomer',
                description: 'Welcome & autorole system',
                value: 'welcomer',
                emoji: '👋'
            },
            {
                label: 'Tickets',
                description: 'Support ticket system',
                value: 'ticket',
                emoji: '🎫'
            }
        ]));
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
            name: `${client.user.username} Help Center`,
            iconURL: client.user.displayAvatarURL()
        })
            .setDescription(`### Welcome to Friday! ${client.emoji.hii}\n\n` +
            `${client.emoji.dot} **Prefix:** \`${prefix}\`\n` +
            `${client.emoji.dot} **Commands:** \`${client.util.countCommandsAndSubcommands(client)}\`\n` +
            `${client.emoji.dot} **Get Started:** \`${prefix}antinuke enable\`\n\n` +
            `${client.config.baseText}`)
            .addFields({
            name: '🛡️ Security',
            value: '`Protection` `AntiNuke` `Whitelist`',
            inline: true
        }, {
            name: '⚖️ Moderation',
            value: '`Ban` `Kick` `Mute` `Warn`',
            inline: true
        }, {
            name: '🤖 Automation',
            value: '`Automod` `Logging` `Welcome`',
            inline: true
        })
            .setFooter({
            text: `Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1`,
            iconURL: message.author.displayAvatarURL()
        })
            .setTimestamp();
        const content = client.config.owner.includes(message.author.id) || client.config.admin.includes(message.author.id)
            ? `${client.emoji.hii} Hey there, admin! How can I assist you today?`
            : null;
        await message.channel.send({
            content,
            embeds: [embed],
            components: [selectMenu]
        });
    }
};
//# sourceMappingURL=help.js.map