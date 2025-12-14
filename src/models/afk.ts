import type { Database, AfkData } from '../types/index';

/**
 * AFK Model - JoshDB Implementation
 */
class AfkModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async findOne(query: { Member: string; Guild?: string; $or?: Array<{ Guild: string }> }): Promise<AfkData | null> {
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

    async create(data: Omit<AfkData, 'deleteOne'>): Promise<AfkData> {
        const key = `afk_${data.Member}_${data.Guild || 'global'}`;
        const afkData: AfkData = { ...data };
        await this.db.set(key, afkData);
        afkData.deleteOne = async () => await this.db.delete(key);
        return afkData;
    }

    async deleteOne(query: { Member: string; Guild?: string }): Promise<void> {
        const key = `afk_${query.Member}_${query.Guild || 'global'}`;
        await this.db.delete(key);
    }

    async deleteMany(query: { Member: string }): Promise<void> {
        // For deleteMany, we need to implement proper cleanup
        // This is a simplified version - in production you'd want to scan all keys
        const globalKey = `afk_${query.Member}_global`;
        await this.db.delete(globalKey);
    }
}

// Export wrapper that gets db from client or creates new instance
let _db: Database | null = null;
const setDb = (db: Database): void => { _db = db; };

const afkModel = (db?: Database): AfkModel => {
    if (db) return new AfkModel(db);
    // If called without db, use stored db
    if (_db) return new AfkModel(_db);
    throw new Error('AFK Model: Database not initialized');
};

afkModel.setDb = setDb;
afkModel.findOne = async (query: Parameters<AfkModel['findOne']>[0]) => {
    if (!_db) throw new Error('AFK Model: Database not initialized');
    return new AfkModel(_db).findOne(query);
};
afkModel.deleteMany = async (query: { Member: string }) => {
    if (!_db) throw new Error('AFK Model: Database not initialized');
    return new AfkModel(_db).deleteMany(query);
};

export default afkModel;
