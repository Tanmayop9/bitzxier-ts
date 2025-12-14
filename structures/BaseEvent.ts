/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Base event class for all events
 */

class BaseEvent {
    constructor(options = {}) {
        this.name = options.name || 'unknown';
        this.once = options.once || false;
        this.enabled = options.enabled !== false;
    }

    /**
     * Execute the event - to be overridden by child classes
     */
    async execute(...args) {
        throw new Error(`Event ${this.name} doesn't have an execute method!`);
    }

    /**
     * Handle errors in events
     */
    handleError(client, error) {
        console.error(`[Event: ${this.name}] Error:`, error);
        
        if (client.error && typeof client.error.send === 'function') {
            client.error.send({
                embeds: [{
                    title: `Event Error: ${this.name}`,
                    description: `\`\`\`js\n${error.stack || error}\`\`\``,
                    color: 0xFF0000,
                    footer: {
                        text: 'Author: Tanmay | Recoded by Nerox Studios | v2-alpha-1'
                    },
                    timestamp: new Date()
                }]
            }).catch(() => {});
        }
    }
}

module.exports = BaseEvent;
