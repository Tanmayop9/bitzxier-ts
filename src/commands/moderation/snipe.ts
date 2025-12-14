export default {
    name: 'snipe',
    aliases: [],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        // Check if the user has the Manage Messages permission
        if (!message.member.permissions.has('ManageMessages')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must have \`Manage Messages\` permissions to run this command.`
                        )
                ]
            });
        }

        // Retrieve the last snipe data
        const snipeKey = `snipe_${message.guild.id}_${message.channel.id}`;
        const snipe = await client.db.get(snipeKey);

        // Check if there's no snipe data
        if (!snipe) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`There are no deleted messages.`)
                ]
            });
        }

        // Create and send the embed with the sniped message
        const embed = client.util.embed()
            .setColor(client.color)
            .setTitle('Sniped Message')
            .addFields([
                {
                    name: 'Author',
                    value: snipe.author,
                },
                {
                    name: 'Timestamp',
                    value: `${new Date(snipe.timestamp).toLocaleString()}`,
                },
            ])
         if (snipe.content){
             embed.setDescription(`Content\n${snipe.content}`);
         }
        if (snipe.imageUrl) {
            embed.setImage(snipe.imageUrl);
        }

        return message.channel.send({ embeds: [embed] });
    },
};
