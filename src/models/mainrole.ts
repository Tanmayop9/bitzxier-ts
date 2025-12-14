import type { Database, MainRoleData } from '../types/index';
import type { Guild } from 'discord.js';

/**
 * MainRole Model - JoshDB Implementation
 */
class MainRoleModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async getSettings(guild: Guild): Promise<MainRoleData & { save: () => Promise<any> }> {
        const key = `mainrole_${guild.id}`;
        let guildData = await this.db.get(key);
        
        if (!guildData) {
            guildData = {
                Guild: guild.id,
                RoleID: undefined,
                _id: guild.id,
                mainrole: [],
                data: {
                    name: guild.name,
                    region: guild.preferredLocale,
                    owner: {
                        id: guild.ownerId
                    },
                    joinedAt: guild.joinedAt
                },
                save: async () => {
                    await this.db.set(key, guildData);
                    return guildData;
                }
            };
            
            if (!guild.id) {
                throw new Error('Guild ID is undefined');
            }
            
            await this.db.set(key, guildData);
        } else {
            // Add save method to existing data
            guildData.save = async () => {
                await this.db.set(key, guildData);
                return guildData;
            };
        }
        
        return guildData;
    }
}

let _db: Database | null = null;
const setDb = (db: Database): void => { _db = db; };
const getSettings = async (guild: Guild): Promise<MainRoleData & { save: () => Promise<any> }> => {
    if (!_db && (guild as any).client && (guild as any).client.db) {
        _db = (guild as any).client.db;
    }
    if (!_db) throw new Error('Database not initialized');
    const model = new MainRoleModel(_db);
    return await model.getSettings(guild);
};

const mainRoleModel = (db?: Database): MainRoleModel => {
    if (db) return new MainRoleModel(db);
    if (_db) return new MainRoleModel(_db);
    throw new Error('MainRole Model: Database not initialized');
};

mainRoleModel.setDb = setDb;
mainRoleModel.getSettings = getSettings;

export default mainRoleModel;
export { getSettings };
