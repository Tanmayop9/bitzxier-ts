/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Add premium access to a user
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Config loaded from client.config
export default {
    name: 'addpremium',
    aliases: ['addprem', 'premium+'],
    category: 'Owner',
    description: 'Grant premium access to a user',
    usage: '<user_id> [days] [server_count]',
    run: async (client, message, args) => {
        if (!client.config.premium.includes(message.author.id))
            return;
        const embed = client.util.embed()
            .setColor(client.color)
            .setAuthor({
            name: 'Premium Management',
            iconURL: client.user.displayAvatarURL()
        });
        if (!args[0]) {
            return message.channel.send({
                embeds: [embed
                        .setDescription(`${client.emoji.cross} **Invalid Usage**\n\n` +
                        `**Usage:** \`addpremium <user_id> [days] [server_count]\`\n` +
                        `**Example:** \`addpremium 123456789 30 5\``)
                ]
            });
        }
        let user;
        try {
            user = await client.users.fetch(args[0]);
        }
        catch (error) {
            return message.channel.send({
                embeds: [embed.setDescription(`${client.emoji.cross} **Error:** Invalid user ID provided`)]
            });
        }
        const days = args[1] ? parseInt(args[1]) : 30;
        const count = args[2] ? parseInt(args[2]) : 0;
        const time = Date.now() + 86400000 * days;
        await client.db.set(`uprem_${args[0]}`, true);
        await client.db.set(`upremend_${args[0]}`, time);
        await client.db.set(`upremcount_${args[0]}`, count);
        await client.db.set(`upremserver_${args[0]}`, []);
        return message.channel.send({
            embeds: [
                embed
                    .setTitle('✅ Premium Added')
                    .setDescription(`Successfully granted premium access to ${user.tag}\n\n` +
                    `${client.emoji.dot} **User:** <@${args[0]}>\n` +
                    `${client.emoji.dot} **Duration:** \`${days} days\`\n` +
                    `${client.emoji.dot} **Server Limit:** \`${count === 0 ? 'Unlimited' : count}\`\n` +
                    `${client.emoji.dot} **Expires:** <t:${Math.round(time / 1000)}:R>`)
                    .setFooter({ text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1' })
                    .setTimestamp()
            ]
        });
    }
};
//# sourceMappingURL=addpremium.js.map