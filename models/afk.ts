// AFK Model - JoshDB Implementation
class AfkModel {
    constructor(db) {
        this.db = db;
    }

    async findOne(query) {
        if (query.$or) {
            // Check server-specific first
            const serverKey = `afk_${query.Member}_${query.$or[0].Guild}`;
            const serverData = await this.db.get(serverKey);
            if (serverData) {
                serverData.deleteOne = async () => await this.db.delete(serverKey);
                return serverData;
            }
            
            // Check global
            const globalKey = `afk_${query.Member}_global`;
            const globalData = await this.db.get(globalKey);
            if (globalData) {
                globalData.deleteOne = async () => await this.db.delete(globalKey);
                return globalData;
            }
            return null;
        }
        
        const key = `afk_${query.Member}_${query.Guild || 'global'}`;
        const data = await this.db.get(key);
        if (data) {
            data.deleteOne = async () => await this.db.delete(key);
        }
        return data;
    }

    async create(data) {
        const key = `afk_${data.Member}_${data.Guild || 'global'}`;
        const afkData = { ...data };
        await this.db.set(key, afkData);
        afkData.deleteOne = async () => await this.db.delete(key);
        return afkData;
    }

    async deleteOne(query) {
        const key = `afk_${query.Member}_${query.Guild || 'global'}`;
        await this.db.delete(key);
    }
}

// Export wrapper that gets db from client or creates new instance
let _db = null;
const setDb = (db) => { _db = db; };

const afkModel = (db) => {
    if (db) return new AfkModel(db);
    // If called without db, use stored db
    if (_db) return new AfkModel(_db);
    throw new Error('AFK Model: Database not initialized');
};

afkModel.setDb = setDb;

export default afkModel;
