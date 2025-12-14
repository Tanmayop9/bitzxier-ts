/**
 * GuildConfig Model - JoshDB Implementation
 */
class GuildConfigModel {
    db;
    constructor(db) {
        this.db = db;
    }
    async findOne(query) {
        const key = `guildconfig_${query.guildId}`;
        const data = await this.db.get(key);
        if (data) {
            data.save = async () => {
                await this.db.set(key, data);
                return data;
            };
        }
        return data;
    }
    async create(data) {
        const key = `guildconfig_${data.guildId}`;
        const configData = {
            guildId: data.guildId,
            hubChannelId: data.hubChannelId,
            categoryId: data.categoryId,
            interfaceChannelId: data.interfaceChannelId,
            tempVoiceChannels: data.tempVoiceChannels || [],
            save: async () => {
                await this.db.set(key, configData);
                return configData;
            }
        };
        await this.db.set(key, configData);
        return configData;
    }
    async findOneAndUpdate(query, update, options) {
        const key = `guildconfig_${query.guildId}`;
        const existing = await this.db.get(key) || {};
        const newData = { ...existing, ...update };
        newData.save = async () => {
            await this.db.set(key, newData);
            return newData;
        };
        await this.db.set(key, newData);
        return newData;
    }
    async findOneAndDelete(query) {
        const key = `guildconfig_${query.guildId}`;
        const data = await this.db.get(key);
        await this.db.delete(key);
        return data;
    }
}
let _db = null;
const setDb = (db) => { _db = db; };
const guildConfigModel = (db) => {
    if (db)
        return new GuildConfigModel(db);
    if (_db)
        return new GuildConfigModel(_db);
    throw new Error('GuildConfig Model: Database not initialized');
};
guildConfigModel.setDb = setDb;
export default guildConfigModel;
//# sourceMappingURL=guildconfig.js.map