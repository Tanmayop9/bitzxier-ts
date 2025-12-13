/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Display comprehensive bot statistics with modern UI
 */

const BaseCommand = require('../../structures/BaseCommand');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os');

class StatsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'stats',
            aliases: ['botinfo', 'bi', 'about', 'info'],
            category: 'info',
            description: 'Display detailed bot statistics and information',
            usage: '',
            examples: ['stats'],
            cooldown: 10,
            premium: false,
            guildOnly: false
        });
    }

    formatUptime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ') || '0s';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async execute(client, message, args) {
        const uptime = Date.now() - client.uptime;
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
        const channels = client.channels.cache.size;
        const commands = client.commands.size;

        // Get command usage
        let cmdCount = 0;
        try {
            const row = client.cmd?.prepare('SELECT count FROM total_command_count WHERE id = 1').get();
            cmdCount = row ? row.count : 0;
        } catch (e) {
            cmdCount = 0;
        }

        // System stats
        const memUsed = process.memoryUsage().heapUsed;
        const memTotal = os.totalmem();
        const cpuUsage = process.cpuUsage();
        const platform = os.platform();
        const arch = os.arch();
        const nodeVersion = process.version;

        // Create buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('General')
                .setCustomId('stats_general')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📊')
                .setDisabled(true),
            new ButtonBuilder()
                .setLabel('System')
                .setCustomId('stats_system')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setLabel('Links')
                .setCustomId('stats_links')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔗')
        );

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
                name: `${client.user.username} Statistics`,
                iconURL: client.user.displayAvatarURL()
            })
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setDescription(
                `### ${client.emoji.hii} Hello, I'm Friday!\n\n` +
                `A powerful and modern Discord bot designed for server management, ` +
                `security, and automation.`
            )
            .addFields(
                {
                    name: '📊 General Statistics',
                    value:
                        `${client.emoji.dot} **Servers:** \`${guilds.toLocaleString()}\`\n` +
                        `${client.emoji.dot} **Users:** \`${users.toLocaleString()}\`\n` +
                        `${client.emoji.dot} **Channels:** \`${channels.toLocaleString()}\`\n` +
                        `${client.emoji.dot} **Commands:** \`${commands}\``,
                    inline: true
                },
                {
                    name: '⚡ Performance',
                    value:
                        `${client.emoji.dot} **Uptime:** \`${this.formatUptime(uptime)}\`\n` +
                        `${client.emoji.dot} **Ping:** \`${client.ws.ping}ms\`\n` +
                        `${client.emoji.dot} **Memory:** \`${this.formatBytes(memUsed)}\`\n` +
                        `${client.emoji.dot} **Commands Run:** \`${cmdCount.toLocaleString()}\``,
                    inline: true
                },
                {
                    name: '🛠️ Technical',
                    value:
                        `${client.emoji.dot} **Platform:** \`${platform}\`\n` +
                        `${client.emoji.dot} **Node.js:** \`${nodeVersion}\`\n` +
                        `${client.emoji.dot} **Discord.js:** \`v14.16.1\`\n` +
                        `${client.emoji.dot} **Version:** \`v2-alpha-1\``,
                    inline: true
                }
            )
            .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
            .setTimestamp();

        const msg = await message.channel.send({
            embeds: [embed],
            components: [buttons]
        });

        // Button collector
        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 120000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'stats_system') {
                const systemEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({
                        name: `${client.user.username} System Information`,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .addFields(
                        {
                            name: '💾 Memory Usage',
                            value:
                                `${client.emoji.dot} **Used:** \`${this.formatBytes(memUsed)}\`\n` +
                                `${client.emoji.dot} **Total:** \`${this.formatBytes(memTotal)}\`\n` +
                                `${client.emoji.dot} **Free:** \`${this.formatBytes(memTotal - memUsed)}\``,
                            inline: true
                        },
                        {
                            name: '🖥️ System Info',
                            value:
                                `${client.emoji.dot} **OS:** \`${platform} ${arch}\`\n` +
                                `${client.emoji.dot} **CPU Cores:** \`${os.cpus().length}\`\n` +
                                `${client.emoji.dot} **Hostname:** \`${os.hostname()}\``,
                            inline: true
                        }
                    )
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp();

                const newButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('General')
                        .setCustomId('stats_general')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📊'),
                    new ButtonBuilder()
                        .setLabel('System')
                        .setCustomId('stats_system')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⚙️')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setLabel('Links')
                        .setCustomId('stats_links')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🔗')
                );

                await interaction.update({ embeds: [systemEmbed], components: [newButtons] });
            } else if (interaction.customId === 'stats_general') {
                await interaction.update({ embeds: [embed], components: [buttons] });
            } else if (interaction.customId === 'stats_links') {
                const linksEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({
                        name: `${client.user.username} Links`,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription(
                        `### Quick Links\n\n` +
                        `${client.emoji.dot} **[Invite Bot](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)**\n` +
                        `${client.emoji.dot} **[Support Server](${client.support})**\n` +
                        `${client.emoji.dot} **[Vote](https://top.gg/bot/${client.user.id}/vote)**`
                    )
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp();

                const newButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('General')
                        .setCustomId('stats_general')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📊'),
                    new ButtonBuilder()
                        .setLabel('System')
                        .setCustomId('stats_system')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⚙️'),
                    new ButtonBuilder()
                        .setLabel('Links')
                        .setCustomId('stats_links')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🔗')
                        .setDisabled(true)
                );

                await interaction.update({ embeds: [linksEmbed], components: [newButtons] });
            }
        });

        collector.on('end', () => {
            const disabledButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('General')
                    .setCustomId('stats_general')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📊')
                    .setDisabled(true),
                new ButtonBuilder()
                    .setLabel('System')
                    .setCustomId('stats_system')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
                    .setDisabled(true),
                new ButtonBuilder()
                    .setLabel('Links')
                    .setCustomId('stats_links')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔗')
                    .setDisabled(true)
            );

            msg.edit({ components: [disabledButtons] }).catch(() => {});
        });
    }
}

module.exports = new StatsCommand();
