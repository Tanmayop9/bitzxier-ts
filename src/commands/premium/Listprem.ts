/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description List all premium users
 */

import { EmbedBuilder } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Config loaded from client.config

export default {
    name: 'listpremium',
    aliases: ['listprem', 'premusers', 'premlist'],
    category: 'Owner',
    description: 'View all users with premium access',
    run: async (client: any, message: any, args: string[]) => {
        if (!client.config.premium?.includes(message.author.id)) return;

        const embed = client.util.embed()
            .setColor(client.color)
            .setAuthor({
                name: 'Premium Users List',
                iconURL: client.user.displayAvatarURL()
            });

        // Fetch all keys from the database
        const keys = await client.db.all();

        // Filter keys that start with 'uprem_' and have value true
        const premiumUsers = keys.filter(key => key.ID.startsWith('uprem_') && key.data === true);

        if (premiumUsers.length === 0) {
            return message.channel.send({
                embeds: [
                    embed
                        .setDescription(`${client.emoji.cross} **No Premium Users**\n\nThere are currently no users with premium access.`)
                        .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                ]
            });
        }

        // Create a list of premium user details
        const premiumUserList = await Promise.all(premiumUsers.map(async (user, index) => {
            const userId = user.ID.split('_')[1];
            const userEnd = await client.db.get(`upremend_${userId}`);
            const userCount = await client.db.get(`upremcount_${userId}`) || 0;

            return (
                `**${index + 1}.** <@${userId}>\n` +
                `${client.emoji.dot} **Servers:** \`${userCount === 0 ? 'Unlimited' : userCount}\`\n` +
                `${client.emoji.dot} **Expires:** <t:${Math.round(userEnd / 1000)}:R>`
            );
        }));

        return message.channel.send({
            embeds: [
                embed
                    .setTitle(`👑 Premium Users (${premiumUsers.length})`)
                    .setDescription(premiumUserList.join('\n\n'))
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp()
            ]
        });
    }
};

