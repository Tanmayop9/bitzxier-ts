// MainRole Model - JoshDB Implementation
class MainRoleModel {
    constructor(db) {
        this.db = db;
    }

    async getSettings(guild) {
        const key = `mainrole_${guild.id}`;
        let guildData = await this.db.get(key);
        
        if (!guildData) {
            guildData = {
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

let _db = null;
const setDb = (db) => { _db = db; };
const getSettings = async (guild) => {
    if (!_db && guild.client && guild.client.db) {
        _db = guild.client.db;
    }
    if (!_db) throw new Error('Database not initialized');
    const model = new MainRoleModel(_db);
    return await model.getSettings(guild);
};

const mainRoleModel = (db) => {
    if (db) return new MainRoleModel(db);
    if (_db) return new MainRoleModel(_db);
    throw new Error('MainRole Model: Database not initialized');
};

mainRoleModel.setDb = setDb;
mainRoleModel.getSettings = getSettings;

export default mainRoleModel;
