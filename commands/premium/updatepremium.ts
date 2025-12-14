/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Update premium access for a user
 */

import { EmbedBuilder } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Config loaded from client.config

export default {
    name: 'updatepremium',
    aliases: ['updateprem', 'upremium', 'editpremium'],
    category: 'Owner',
    description: 'Update premium settings for a user',
    usage: '<user_id> [days] [server_count]',
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
                        `**Usage:** \`updatepremium <user_id> [days] [server_count]\`\n` +
                        `**Example:** \`updatepremium 123456789 60 10\`\n\n` +
                        `Leave days or server_count empty to keep current values.`
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
                embeds: [embed.setDescription(
                    `${client.emoji.cross} **Not Premium**\n\n` +
                    `<@${args[0]}> doesn't have premium access.\n` +
                    `Use \`addpremium\` command to grant access first.`
                )]
            })
        }

        let time
        let daysAdded = null
        if (args[1]) {
            const days = parseInt(args[1])
            time = Date.now() + 86400000 * days
            daysAdded = days
        } else {
            time = await client.db.get(`upremend_${args[0]}`)
        }

        let count
        if (args[2]) {
            count = parseInt(args[2])
        } else {
            count = (await client.db.get(`upremcount_${args[0]}`)) || 0
        }

        await client.db.set(`uprem_${args[0]}`, true)
        await client.db.set(`upremend_${args[0]}`, time)
        await client.db.set(`upremcount_${args[0]}`, count)

        return message.channel.send({
            embeds: [
                embed
                    .setTitle('🔄 Premium Updated')
                    .setDescription(
                        `Successfully updated premium settings for ${user.tag}\n\n` +
                        `${client.emoji.dot} **User:** <@${args[0]}>\n` +
                        `${client.emoji.dot} **Duration:** ${daysAdded ? `\`${daysAdded} days\`` : '`Unchanged`'}\n` +
                        `${client.emoji.dot} **Server Limit:** \`${count === 0 ? 'Unlimited' : count}\`\n` +
                        `${client.emoji.dot} **Expires:** <t:${Math.round(time / 1000)}:R>`
                    )
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp()
            ]
        })
    }
}

