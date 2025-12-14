// Ticket Model - JoshDB Implementation
class TicketModel {
    constructor(db) {
        this.db = db;
    }

    async findOne(query) {
        const key = `ticket_${query.guildId}`;
        const data = await this.db.get(key);
        if (data) {
            data.save = async () => {
                data.updatedAt = new Date();
                await this.db.set(key, data);
                return data;
            };
        }
        return data;
    }

    async create(data) {
        const key = `ticket_${data.guildId}`;
        const ticketData = {
            guildId: data.guildId,
            panels: data.panels || [],
            createdBy: data.createdBy || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            save: async () => {
                ticketData.updatedAt = new Date();
                await this.db.set(key, ticketData);
                return ticketData;
            }
        };
        await this.db.set(key, ticketData);
        return ticketData;
    }

    async findOneAndUpdate(query, update, options) {
        const key = `ticket_${query.guildId}`;
        let existing = await this.db.get(key);
        
        if (!existing && options?.upsert) {
            existing = {
                guildId: query.guildId,
                panels: [],
                createdBy: [],
                createdAt: new Date()
            };
        }
        
        const newData = { 
            ...existing, 
            ...update,
            updatedAt: new Date(),
            save: async () => {
                newData.updatedAt = new Date();
                await this.db.set(key, newData);
                return newData;
            }
        };
        
        await this.db.set(key, newData);
        return newData;
    }

    async deleteOne(query) {
        const key = `ticket_${query.guildId}`;
        await this.db.delete(key);
    }
}

let _db = null;
const setDb = (db) => { _db = db; };

const ticketModel = (db) => {
    if (db) return new TicketModel(db);
    if (_db) return new TicketModel(_db);
    throw new Error('Ticket Model: Database not initialized');
};

ticketModel.setDb = setDb;

export default ticketModel;
