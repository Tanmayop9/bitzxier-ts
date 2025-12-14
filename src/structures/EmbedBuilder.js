/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Modern embed builder with standardized design
 */
import { EmbedBuilder } from 'discord.js';
class ModernEmbedBuilder {
    constructor(client) {
        this.client = client;
        this.defaultColor = client?.color || 0x5865F2;
    }
    /**
     * Create a base embed with default settings
     */
    create() {
        return new EmbedBuilder()
            .setColor(this.defaultColor)
            .setTimestamp()
            .setFooter({
            text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1'
        });
    }
    /**
     * Create a success embed
     */
    success(title, description) {
        return this.create()
            .setColor('#00FF00')
            .setAuthor({
            name: title,
            iconURL: this.client?.user?.displayAvatarURL()
        })
            .setDescription(`${this.client?.emoji?.tick || '✅'} ${description}`);
    }
    /**
     * Create an error embed
     */
    error(title, description) {
        return this.create()
            .setColor('#FF0000')
            .setAuthor({
            name: title,
            iconURL: this.client?.user?.displayAvatarURL()
        })
            .setDescription(`${this.client?.emoji?.cross || '❌'} ${description}`);
    }
    /**
     * Create a warning embed
     */
    warning(title, description) {
        return this.create()
            .setColor('#FFA500')
            .setAuthor({
            name: title,
            iconURL: this.client?.user?.displayAvatarURL()
        })
            .setDescription(`${this.client?.emoji?.process || '⚠️'} ${description}`);
    }
    /**
     * Create an info embed
     */
    info(title, description) {
        return this.create()
            .setAuthor({
            name: title,
            iconURL: this.client?.user?.displayAvatarURL()
        })
            .setDescription(description);
    }
    /**
     * Create a loading embed
     */
    loading(message = 'Loading...') {
        return this.create()
            .setDescription(`${this.client?.emoji?.process || '⏳'} ${message}`);
    }
    /**
     * Create a paginated embed
     */
    paginated(data, currentPage = 0, itemsPerPage = 10) {
        const pages = Math.ceil(data.length / itemsPerPage);
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const items = data.slice(start, end);
        return this.create()
            .setDescription(items.join('\n'))
            .setFooter({
            text: `Page ${currentPage + 1}/${pages} | Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1`
        });
    }
    /**
     * Create a command usage embed
     */
    usage(command, prefix = '&') {
        const embed = this.create()
            .setAuthor({
            name: `Command: ${command.name}`,
            iconURL: this.client?.user?.displayAvatarURL()
        })
            .setDescription(command.description || 'No description provided');
        if (command.usage) {
            embed.addFields({
                name: 'Usage',
                value: `\`${prefix}${command.name} ${command.usage}\``,
                inline: false
            });
        }
        if (command.aliases && command.aliases.length > 0) {
            embed.addFields({
                name: 'Aliases',
                value: command.aliases.map(a => `\`${a}\``).join(', '),
                inline: true
            });
        }
        if (command.examples && command.examples.length > 0) {
            embed.addFields({
                name: 'Examples',
                value: command.examples.map(e => `\`${prefix}${e}\``).join('\n'),
                inline: false
            });
        }
        return embed;
    }
}
export default ModernEmbedBuilder;
//# sourceMappingURL=EmbedBuilder.js.map