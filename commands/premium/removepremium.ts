/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Remove premium access from a user
 */

import { EmbedBuilder } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Config loaded from client.config

export default {
    name: 'removepremium',
    aliases: ['remprem', 'premium-', 'delpremium'],
    category: 'Owner',
    description: 'Revoke premium access from a user',
    usage: '<user_id>',
    run: async (client, message, args) => {
        if (!config.premium.includes(message.author.id)) return
        
        const embed = client.util.embed()
            .setColor(client.color)
            .setAuthor({
                name: 'Premium Management',
                iconURL: client.user.displayAvatarURL()
            })
        
        if (!args[0]) {
            return message.channel.send({
                embeds: [embed
                    .setDescription(
                        `${client.emoji.cross} **Invalid Usage**\n\n` +
                        `**Usage:** \`removepremium <user_id>\`\n` +
                        `**Example:** \`removepremium 123456789\``
                    )
                ]
            })
        }

        let user;
        try {
            user = await client.users.fetch(args[0])
        } catch (error) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} **Error:** Invalid user ID provided`)]
            })
        }

        const isPremium = await client.db.get(`uprem_${args[0]}`)
        if (!isPremium) {
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} **Not Premium**\n\n` +
                        `<@${args[0]}> doesn't have premium access.`
                    )
                ]
            })
        }

        await client.db.delete(`uprem_${args[0]}`)
        await client.db.delete(`upremend_${args[0]}`)
        await client.db.delete(`upremcount_${args[0]}`)
        await client.db.delete(`upremserver_${args[0]}`)

        return message.channel.send({
            embeds: [
                embed
                    .setTitle('❌ Premium Removed')
                    .setDescription(
                        `Successfully revoked premium access from ${user.tag}\n\n` +
                        `${client.emoji.dot} **User:** <@${args[0]}>\n` +
                        `${client.emoji.dot} **Status:** Premium access revoked`
                    )
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp()
            ]
        })
    }
}
