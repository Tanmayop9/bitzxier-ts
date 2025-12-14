/**
 * Boost Model - JoshDB Implementation
 */
class BoostModel {
    db;
    constructor(db) {
        this.db = db;
    }
    async findOne(query) {
        const key = `boost_${query.Guild}`;
        return await this.db.get(key);
    }
    async create(data) {
        const key = `boost_${data.Guild}`;
        await this.db.set(key, data);
        return data;
    }
    async findOneAndUpdate(query, update, options) {
        const key = `boost_${query.Guild}`;
        const existing = await this.db.get(key) || {};
        const newData = { ...existing, ...update };
        await this.db.set(key, newData);
        return newData;
    }
    async save() {
        // For compatibility
        return this;
    }
}
let _db = null;
const setDb = (db) => { _db = db; };
const boostModel = (db) => {
    if (db)
        return new BoostModel(db);
    if (_db)
        return new BoostModel(_db);
    throw new Error('Boost Model: Database not initialized');
};
boostModel.setDb = setDb;
export default boostModel;
//# sourceMappingURL=boost.js.map