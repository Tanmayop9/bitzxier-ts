import type { Database, TicketData } from '../types/index';

/**
 * Ticket Model - JoshDB Implementation
 */
class TicketModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async findOne(query: { guildId: string }): Promise<TicketData | null> {
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

    async create(data: Omit<TicketData, 'save'> & { panels?: any[]; createdBy?: any[] }): Promise<TicketData & { panels?: any[]; createdBy?: any[]; createdAt?: Date; updatedAt?: Date }> {
        const key = `ticket_${data.guildId}`;
        const ticketData: any = {
            guildId: data.guildId,
            panels: (data as any).panels || [],
            createdBy: (data as any).createdBy || [],
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

    async findOneAndUpdate(query: { guildId: string }, update: Partial<TicketData>, options?: { upsert?: boolean }): Promise<TicketData & { updatedAt?: Date }> {
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
        
        const newData: any = { 
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

    async deleteOne(query: { guildId: string }): Promise<void> {
        const key = `ticket_${query.guildId}`;
        await this.db.delete(key);
    }
}

let _db: Database | null = null;
const setDb = (db: Database): void => { _db = db; };

const ticketModel = (db?: Database): TicketModel => {
    if (db) return new TicketModel(db);
    if (_db) return new TicketModel(_db);
    throw new Error('Ticket Model: Database not initialized');
};

ticketModel.setDb = setDb;

export default ticketModel;
