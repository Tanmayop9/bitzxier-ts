/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Manage command scheduling and auto-enable/disable
 */

module.exports = {
    name: 'cmdschedule',
    aliases: ['commandschedule', 'schedcmd'],
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

        if (!subcommand || subcommand === 'list') {
            // List all scheduled commands and disabled commands
            const report = client.commandScheduler.getStatusReport();

            const embed = client.util
                .embed()
                .setColor(client.color)
                .setTitle('📅 Command Scheduler Status')
                .setDescription(
                    `Disabled: ${report.totalDisabled} | Schedules: ${report.totalSchedules} | Active: ${report.activeSchedules}`
                );

            if (report.disabledCommands.length > 0) {
                embed.addFields({
                    name: '❌ Currently Disabled Commands',
                    value: report.disabledCommands.map(cmd => `• \`${cmd}\``).join('\n'),
                });
            }

            if (report.scheduledCommands.length > 0) {
                const scheduleList = report.scheduledCommands.map(s => 
                    `• \`${s.name}\` - ${s.enabled ? '✅ Active' : '❌ Inactive'}\n  Enable: \`${s.enableCron}\` | Disable: \`${s.disableCron}\``
                ).join('\n');
                
                embed.addFields({
                    name: '📅 Scheduled Commands',
                    value: scheduleList,
                });
            }

            return message.channel.send({ embeds: [embed] });
        }

        if (subcommand === 'disable') {
            const commandName = args[1];

            if (!commandName) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`cmdschedule disable <command>\``
                            ),
                    ],
                });
            }

            await client.commandScheduler.disableCommand(commandName, 'Manual disable');

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setDescription(
                            `${client.emoji.tick} | Command \`${commandName}\` has been disabled`
                        ),
                ],
            });
        }

        if (subcommand === 'enable') {
            const commandName = args[1];

            if (!commandName) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`cmdschedule enable <command>\``
                            ),
                    ],
                });
            }

            await client.commandScheduler.enableCommand(commandName, 'Manual enable');

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setDescription(
                            `${client.emoji.tick} | Command \`${commandName}\` has been enabled`
                        ),
                ],
            });
        }

        if (subcommand === 'schedule') {
            const commandName = args[1];
            const enableCron = args[2];
            const disableCron = args[3];

            if (!commandName || !enableCron || !disableCron) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setTitle('Schedule a Command')
                            .setDescription(
                                `Usage: \`cmdschedule schedule <command> "<enable_cron>" "<disable_cron>"\`\n\n` +
                                `**Example:** Enable ping every Saturday, disable every Sunday:\n` +
                                `\`cmdschedule schedule ping "0 0 * * 6" "0 0 * * 0"\`\n\n` +
                                `**Cron Format:** \`minute hour day month weekday\`\n` +
                                `• 0 = Sunday, 6 = Saturday\n` +
                                `• \`0 0 * * 6\` = Saturday midnight\n` +
                                `• \`0 0 * * 0\` = Sunday midnight`
                            ),
                    ],
                });
            }

            try {
                await client.commandScheduler.createSchedule(commandName, {
                    enabled: true,
                    enableCron,
                    disableCron,
                    description: `Auto-schedule for ${commandName}`,
                });

                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0x00ff00)
                            .setTitle('✅ Schedule Created')
                            .setDescription(
                                `Command \`${commandName}\` scheduled successfully!\n\n` +
                                `**Enable:** \`${enableCron}\`\n` +
                                `**Disable:** \`${disableCron}\``
                            ),
                    ],
                });
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(0xff0000)
                            .setDescription(
                                `${client.emoji.cross} | Failed to create schedule: ${error.message}`
                            ),
                    ],
                });
            }
        }

        if (subcommand === 'remove') {
            const commandName = args[1];

            if (!commandName) {
                return message.channel.send({
                    embeds: [
                        client.util
                            .embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Usage: \`cmdschedule remove <command>\``
                            ),
                    ],
                });
            }

            await client.commandScheduler.removeSchedule(commandName);

            return message.channel.send({
                embeds: [
                    client.util
                        .embed()
                        .setColor(0x00ff00)
                        .setDescription(
                            `${client.emoji.tick} | Schedule removed for \`${commandName}\``
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
                    .setTitle('📅 Command Scheduler')
                    .setDescription(
                        'Automatically enable/disable commands on schedule\n\n' +
                        '**Subcommands:**\n' +
                        '`list` - Show all schedules and disabled commands\n' +
                        '`enable <command>` - Enable a command\n' +
                        '`disable <command>` - Disable a command\n' +
                        '`schedule <command> "<enable_cron>" "<disable_cron>"` - Create schedule\n' +
                        '`remove <command>` - Remove schedule\n\n' +
                        '**Example:**\n' +
                        '`cmdschedule schedule ping "0 0 * * 6" "0 0 * * 0"`\n' +
                        'Enables ping on Saturdays, disables on Sundays'
                    ),
            ],
        });
    },
};
