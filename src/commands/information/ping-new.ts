/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Check bot latency and response time with modern design
 */

import BaseCommand from '../../structures/BaseCommand';
import { EmbedBuilder } from 'discord.js';

class PingCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ping',
            aliases: ['latency', 'pong', 'ms'],
            category: 'info',
            description: 'Check the bot\'s latency and response time',
            usage: '',
            examples: ['ping'],
            cooldown: 5,
            premium: false,
            guildOnly: false
        });
    }

    async execute(client, message, args) {
        // Send initial loading message
        const loadingEmbed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.process} Calculating latency...`);

        const timestamp = Date.now();
        const msg = await message.channel.send({ embeds: [loadingEmbed] });
        
        const msgLatency = Date.now() - timestamp;
        const wsLatency = client.ws.ping;
        const apiLatency = Date.now() - message.createdTimestamp;

        // Calculate average latency
        const avgLatency = Math.round((msgLatency + wsLatency + apiLatency) / 3);

        // Determine performance status
        const getStatus = (ping) => {
            if (ping <= 100) return { emoji: '🟢', text: 'Excellent', color: '#00FF00' };
            if (ping <= 200) return { emoji: '🟡', text: 'Good', color: '#FFFF00' };
            if (ping <= 400) return { emoji: '🟠', text: 'Fair', color: '#FFA500' };
            return { emoji: '🔴', text: 'Poor', color: '#FF0000' };
        };

        const status = getStatus(avgLatency);

        // Create performance bar
        const createBar = (value, max = 500) => {
            const percentage = Math.min((value / max) * 100, 100);
            const filled = Math.round(percentage / 10);
            const empty = 10 - filled;
            return '█'.repeat(filled) + '░'.repeat(empty);
        };

        const embed = new EmbedBuilder()
            .setColor(status.color)
            .setAuthor({
                name: '🏓 Pong!',
                iconURL: client.user.displayAvatarURL()
            })
            .setTitle('Latency Statistics')
            .setDescription(
                `### ${status.emoji} Overall Status: ${status.text}\n\n` +
                `**Average Latency:** \`${avgLatency}ms\``
            )
            .addFields(
                {
                    name: '📡 WebSocket Latency',
                    value: `\`\`\`\n${createBar(wsLatency)}\n${wsLatency}ms\`\`\``,
                    inline: true
                },
                {
                    name: '💬 Message Latency',
                    value: `\`\`\`\n${createBar(msgLatency)}\n${msgLatency}ms\`\`\``,
                    inline: true
                },
                {
                    name: '🌐 API Latency',
                    value: `\`\`\`\n${createBar(apiLatency)}\n${apiLatency}ms\`\`\``,
                    inline: true
                },
                {
                    name: '⏱️ Bot Uptime',
                    value: `Started <t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
                    inline: false
                }
            )
            .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
            .setTimestamp();

        await msg.edit({ embeds: [embed] });
    }
}

export default new PingCommand();
