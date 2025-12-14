import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import axios from 'axios';
export default {
    name: 'wouldyourather',
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
    try {
      const request = await axios.get("https://api.truthordarebot.xyz/api/wyr");
      const embed = client.util.embed()
        .setColor(client.color)
        .setTitle(`${request.data.question}`)
        .setFooter({ text : `Would You Rather ??`,iconURL : message.author.displayAvatarURL({dynamic : true})})
      return message.channel.send({embeds: [embed] })
    } catch(e) {
      return message.channel.send({embeds: [client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | truth or dare api is **currently down**.`)]})
    }
  }
}