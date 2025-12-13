/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Manage announcements and sneak peeks
 */

module.exports = {
    name: 'announce',
    aliases: ['announcement', 'sneakpeek'],
    category: 'dev',
    premium: false,
    cooldown: 10,
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

        if (subcommand === 'peek') {
            // Add sneak peek
            const action = args[1]?.toLowerCase();

            if (action === 'add') {
                const id = args[2];
                const name = args[3];
                const description = args.slice(4).join(' ');

                if (!id || !name || !description) {
                    return message.channel.send({
                        embeds: [
                            client.util
                                .embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Usage: \`announce peek add <id> <name> <description>\``
                                ),
                        ],
                    });
                }

                await client.announcementManager.addSneakPeek(id, name, description);

                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0x00ff00)
                            .setTitle('✅ Sneak Peek Added')
                            .addFields([
                                { name: 'ID', value: id },
                                { name: 'Name', value: name },
                                { name: 'Description', value: description },
                            ]),
                    ],
                });
            }

            if (action === 'list') {
                const peeks = client.announcementManager.getAllSneakPeeks();

                if (peeks.length === 0) {
                    return message.channel.send({
                        embeds: [
                            client.util
                                .embed()
                                .setColor(client.color)
                                .setDescription('No sneak peeks configured'),
                        ],
                    });
                }

                const embed = client.util
                    .embed()
                    .setColor(client.color)
                    .setTitle('👀 Sneak Peeks');

                peeks.forEach(peek => {
                    embed.addFields({
                        name: `${peek.released ? '✅' : '🔜'} ${peek.name}`,
                        value: `**ID:** ${peek.id}\n**Description:** ${peek.description}\n**Status:** ${peek.released ? 'Released' : 'Pending'}`,
                    });
                });

                return message.channel.send({ embeds: [embed] });
            }

            if (action === 'release') {
                const id = args[2];

                if (!id) {
                    return message.channel.send({
                        embeds: [
                            client.util
                                .embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Usage: \`announce peek release <id>\``
                                ),
                        ],
                    });
                }

                await client.announcementManager.markSneakPeekReleased(id);

                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0x00ff00)
                            .setDescription(
                                `${client.emoji.tick} | Sneak peek \`${id}\` marked as released`
                            ),
                    ],
                });
            }

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(client.color)
                        .setTitle('Sneak Peek Management')
                        .setDescription(
                            '**Commands:**\n' +
                            '`announce peek add <id> <name> <description>` - Add sneak peek\n' +
                            '`announce peek list` - List all sneak peeks\n' +
                            '`announce peek release <id>` - Mark as released'
                        ),
                ],
            });
        }

        if (subcommand === 'history') {
            const history = client.announcementManager.getUpdateHistory(10);

            if (history.length === 0) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription('No update history'),
                    ],
                });
            }

            const embed = client.util
                .embed()
                .setColor(client.color)
                .setTitle('📜 Update History');

            history.forEach((update, index) => {
                embed.addFields({
                    name: `v${update.version} - ${new Date(update.date).toLocaleDateString()}`,
                    value: `${update.message}\n**Announced to:** ${update.announcementCount} servers`,
                });
            });

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'custom') {
            // Send custom announcement
            const title = args[1];
            const description = args.slice(2).join(' ');

            if (!title || !description) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`announce custom <title> <description>\``
                            ),
                    ],
                });
            }

            const count = await client.announcementManager.sendCustomAnnouncement(
                title,
                description,
                { mention: false }
            );

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setDescription(
                            `${client.emoji.tick} | Announcement sent to ${count} servers`
                        ),
                ],
            });
        }

        if (subcommand === 'setchannel') {
            const channel = message.mentions.channels.first() || 
                           message.guild.channels.cache.get(args[1]);

            if (!channel) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`announce setchannel #channel\``
                            ),
                    ],
                });
            }

            await client.announcementManager.setNoticeChannel(message.guild.id, channel.id);

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setDescription(
                            `${client.emoji.tick} | Notice channel set to ${channel}`
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
                    .setTitle('📢 Announcement Manager')
                    .setDescription(
                        'Manage bot announcements and sneak peeks\n\n' +
                        '**Subcommands:**\n' +
                        '`peek add <id> <name> <description>` - Add sneak peek\n' +
                        '`peek list` - List sneak peeks\n' +
                        '`peek release <id>` - Mark sneak peek as released\n' +
                        '`history` - View update history\n' +
                        '`custom <title> <description>` - Send custom announcement\n' +
                        '`setchannel #channel` - Set notice channel for this server'
                    ),
            ],
        });
    },
};
