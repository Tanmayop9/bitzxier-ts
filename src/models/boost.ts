import type { Database, BoostData } from '../types/index';

/**
 * Boost Model - JoshDB Implementation
 */
class BoostModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async findOne(query: { Guild: string }): Promise<BoostData | null> {
        const key = `boost_${query.Guild}`;
        return await this.db.get(key);
    }

    async create(data: Omit<BoostData, 'save'>): Promise<BoostData> {
        const key = `boost_${data.Guild}`;
        await this.db.set(key, data);
        return data;
    }

    async findOneAndUpdate(query: { Guild: string }, update: Partial<BoostData>, options?: any): Promise<BoostData> {
        const key = `boost_${query.Guild}`;
        const existing = await this.db.get(key) || {};
        const newData: BoostData = { ...existing, ...update };
        await this.db.set(key, newData);
        return newData;
    }

    async save(): Promise<this> {
        // For compatibility
        return this;
    }
}

let _db: Database | null = null;
const setDb = (db: Database): void => { _db = db; };

const boostModel = (db?: Database): BoostModel => {
    if (db) return new BoostModel(db);
    if (_db) return new BoostModel(_db);
    throw new Error('Boost Model: Database not initialized');
};

boostModel.setDb = setDb;

export default boostModel;
