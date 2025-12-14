import type { Database, GuildConfigData } from '../types/index';

/**
 * GuildConfig Model - JoshDB Implementation
 */
class GuildConfigModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async findOne(query: { guildId: string }): Promise<GuildConfigData | null> {
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

    async create(data: Omit<GuildConfigData, 'save'>): Promise<GuildConfigData> {
        const key = `guildconfig_${data.guildId}`;
        const configData: GuildConfigData = {
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

    async findOneAndUpdate(query: { guildId: string }, update: Partial<GuildConfigData>, options?: any): Promise<GuildConfigData> {
        const key = `guildconfig_${query.guildId}`;
        const existing = await this.db.get(key) || {};
        const newData: GuildConfigData = { ...existing, ...update };
        newData.save = async () => {
            await this.db.set(key, newData);
            return newData;
        };
        await this.db.set(key, newData);
        return newData;
    }

    async findOneAndDelete(query: { guildId: string }): Promise<GuildConfigData | null> {
        const key = `guildconfig_${query.guildId}`;
        const data = await this.db.get(key);
        await this.db.delete(key);
        return data;
    }
}

let _db: Database | null = null;
const setDb = (db: Database): void => { _db = db; };

const guildConfigModel = (db?: Database): GuildConfigModel => {
    if (db) return new GuildConfigModel(db);
    if (_db) return new GuildConfigModel(_db);
    throw new Error('GuildConfig Model: Database not initialized');
};

guildConfigModel.setDb = setDb;

export default guildConfigModel;
