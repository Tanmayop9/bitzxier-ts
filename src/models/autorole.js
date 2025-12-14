/**
 * Autorole Model - JoshDB Implementation
 */
class AutoroleModel {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSettingsar(guild) {
        const key = `autorole_${guild.id}`;
        let guildData = await this.db.get(key);
        if (!guildData) {
            guildData = {
                Guild: guild.id,
                Roles: [],
                _id: guild.id,
                data: {
                    name: guild.name,
                    region: guild.preferredLocale,
                    owner: {
                        id: guild.ownerId,
                        tag: guild.members.cache.get(guild.ownerId)?.user.tag
                    },
                    joinedAt: guild.joinedAt,
                    bots: 0
                },
                booster: null,
                welcome: {
                    autodel: 0,
                    enabled: false,
                    channel: null,
                    content: null,
                    embed: {
                        image: null,
                        description: null,
                        color: null,
                        title: null,
                        thumbnail: false,
                        footer: null
                    }
                },
                autorole: [],
                autorolebot: [],
                mainrole: [],
                save: async () => {
                    await this.db.set(key, guildData);
                    return guildData;
                }
            };
            if (!guild.id) {
                throw new Error('Guild ID is undefined');
            }
            await this.db.set(key, guildData);
        }
        else {
            // Add save method to existing data
            guildData.save = async () => {
                await this.db.set(key, guildData);
                return guildData;
            };
        }
        return guildData;
    }
}
// Export wrapper that gets db from client
let _db = null;
const setDb = (db) => { _db = db; };
const getSettingsar = async (guild) => {
    if (!_db && guild.client && guild.client.db) {
        _db = guild.client.db;
    }
    if (!_db)
        throw new Error('Database not initialized');
    const model = new AutoroleModel(_db);
    return await model.getSettingsar(guild);
};
export default { getSettingsar, setDb };
export { getSettingsar, setDb };
//# sourceMappingURL=autorole.js.map