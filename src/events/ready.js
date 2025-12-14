/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Ready event handler - Called when bot is ready
 */
import { ActivityType } from 'discord.js';
export default async (client) => {
    client.on('ready', async () => {
        client.ready = true;
        // Set bot presence
        client.user.setPresence({
            activities: [
                {
                    name: 'FasterThanLight..!!',
                    type: ActivityType.Listening,
                },
            ],
            status: 'online',
        });
        // Log ready status
        client.logger.log(`Logged in as ${client.user.tag}`, 'ready');
        client.logger.log(`Serving ${client.guilds.cache.size} guilds`, 'ready');
        client.logger.log(`Connected to ${client.channels.cache.size} channels`, 'ready');
        // Log health status
        const health = await client.healthCheck.getHealthReport();
        client.logger.debug(`Bot health: ${health.overall}`);
    });
};
//# sourceMappingURL=ready.js.map