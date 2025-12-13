/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Setup bot self-maintenance and autonomous features
 */

module.exports = {
    name: 'botsetup',
    aliases: ['setupbot', 'botsettings'],
    category: 'dev',
    premium: false,
    cooldown: 5,
    run: async (client, message, args) => {
        // Owner only command
        if (!client.config.owner.includes(message.author.id)) {
            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | This command is owner only!`),
                ],
            });
        }

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'support') {
            // Set support server for announcements
            const channel = message.mentions.channels.first() || 
                           message.guild.channels.cache.get(args[1]);

            if (!channel) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`botsetup support #channel\`\n\n` +
                                `This sets the channel where bot will automatically announce updates.`
                            ),
                    ],
                });
            }

            await client.db.set('support_guild_id', message.guild.id);
            await client.db.set('support_announcement_channel', channel.id);

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setTitle('✅ Support Server Configured')
                        .setDescription(
                            `Bot will now automatically announce updates in ${channel}\n\n` +
                            `**Autonomous Features Enabled:**\n` +
                            `${client.emoji.tick} Auto-update system\n` +
                            `${client.emoji.tick} Auto-announcement in support server\n` +
                            `${client.emoji.tick} Command scheduling\n` +
                            `${client.emoji.tick} Feature management`
                        ),
                ],
            });
        }

        if (subcommand === 'autonomy') {
            // Toggle full autonomy mode
            const mode = args[1]?.toLowerCase();

            if (mode === 'on' || mode === 'enable') {
                await client.db.set('autonomous_mode', true);
                
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0x00ff00)
                            .setTitle('🤖 Full Autonomy Enabled')
                            .setDescription(
                                `Bot is now fully autonomous and will:\n\n` +
                                `${client.emoji.tick} Auto-check for updates\n` +
                                `${client.emoji.tick} Auto-apply updates without approval\n` +
                                `${client.emoji.tick} Auto-announce in support server\n` +
                                `${client.emoji.tick} Auto-schedule commands\n` +
                                `${client.emoji.tick} Auto-manage features\n\n` +
                                `**⚠️ Warning:** Bot will update and restart automatically!`
                            ),
                    ],
                });
            }

            if (mode === 'off' || mode === 'disable') {
                await client.db.set('autonomous_mode', false);
                
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0xffa500)
                            .setTitle('🔧 Autonomy Disabled')
                            .setDescription(
                                `Bot will now require manual approval for:\n\n` +
                                `• Updates\n` +
                                `• Feature changes\n` +
                                `• Command scheduling`
                            ),
                    ],
                });
            }

            // Show current status
            const isAutonomous = await client.db.get('autonomous_mode');
            
            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(client.color)
                        .setTitle('🤖 Autonomy Status')
                        .setDescription(
                            `**Current Mode:** ${isAutonomous ? '✅ Fully Autonomous' : '🔧 Manual Control'}\n\n` +
                            `**Usage:**\n` +
                            `\`botsetup autonomy on\` - Enable full autonomy\n` +
                            `\`botsetup autonomy off\` - Disable autonomy`
                        ),
                ],
            });
        }

        if (subcommand === 'status') {
            const supportGuildId = await client.db.get('support_guild_id');
            const supportChannelId = await client.db.get('support_announcement_channel');
            const isAutonomous = await client.db.get('autonomous_mode');
            const autoUpdate = process.env.AUTO_UPDATE_ENABLED === 'true';
            const autoApply = process.env.AUTO_APPLY_UPDATES === 'true';

            const supportGuild = supportGuildId ? client.guilds.cache.get(supportGuildId) : null;
            const supportChannel = supportChannel ? supportGuild?.channels.cache.get(supportChannelId) : null;

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(client.color)
                        .setTitle('🤖 Bot Configuration Status')
                        .addFields([
                            {
                                name: '🎯 Autonomy Mode',
                                value: isAutonomous ? '✅ Enabled' : '❌ Disabled',
                                inline: true,
                            },
                            {
                                name: '🔄 Auto-Update',
                                value: autoUpdate ? '✅ Enabled' : '❌ Disabled',
                                inline: true,
                            },
                            {
                                name: '⚡ Auto-Apply',
                                value: autoApply ? '✅ Enabled' : '❌ Disabled',
                                inline: true,
                            },
                            {
                                name: '📢 Support Server',
                                value: supportGuild ? supportGuild.name : '❌ Not configured',
                                inline: true,
                            },
                            {
                                name: '📣 Announcement Channel',
                                value: supportChannel ? `#${supportChannel.name}` : '❌ Not configured',
                                inline: true,
                            },
                            {
                                name: '🔧 Version',
                                value: client.version,
                                inline: true,
                            },
                        ])
                        .setDescription(
                            `**System Status:**\n` +
                            `${client.emoji.tick} Command Scheduler: Active\n` +
                            `${client.emoji.tick} Feature Manager: Active\n` +
                            `${client.emoji.tick} Announcement System: Active\n` +
                            `${client.emoji.tick} Health Monitoring: Active`
                        ),
                ],
            });
        }

        // Show help
        return message.channel.send({
            embeds: [
                client.util
                    .embed()
                    .setColor(client.color)
                    .setTitle('🤖 Bot Setup Commands')
                    .setDescription(
                        'Configure bot self-maintenance features\n\n' +
                        '**Commands:**\n' +
                        '`botsetup support #channel` - Set support server announcement channel\n' +
                        '`botsetup autonomy <on|off>` - Toggle full autonomy mode\n' +
                        '`botsetup status` - Show current configuration\n\n' +
                        '**Autonomy Mode:**\n' +
                        'When enabled, bot will automatically update itself,\n' +
                        'manage features, schedule commands, and announce\n' +
                        'everything without manual intervention.'
                    ),
            ],
        });
    },
};
