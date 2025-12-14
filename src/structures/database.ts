import { JoshProvider } from '@joshdb/json';
import { Josh } from '@joshdb/core';
import path from 'path';

class Database {
    private provider: any;
    private db: any;
    private connected: boolean;

    constructor() {
        // Main database for general key-value storage
        this.provider = new JoshProvider({
            name: 'main',
            dataDir: path.join(process.cwd(), 'data-sets')
        });
        
        this.db = null;
        this.connected = false;
    }

    async connect() {
        if (this.connected) return;
        
        this.db = new Josh({
            name: 'main',
            provider: this.provider
        });
        
        await this.db.defer;
        this.connected = true;
    }

    async get(key, defaultValue = null) {
        if (!this.connected) await this.connect();
        try {
            const value = await this.db.get(key);
            return value !== undefined && value !== null ? value : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    async set(key, value) {
        if (!this.connected) await this.connect();
        return await this.db.set(key, value);
    }

    async delete(key) {
        if (!this.connected) await this.connect();
        return await this.db.delete(key);
    }

    async has(key) {
        if (!this.connected) await this.connect();
        return await this.db.has(key);
    }

    async all() {
        if (!this.connected) await this.connect();
        const keys = await this.db.keys;
        const result = [];
        for (const key of keys) {
            const value = await this.db.get(key);
            result.push({ ID: key, data: value });
        }
        return result;
    }

    async keys() {
        if (!this.connected) await this.connect();
        return await this.db.keys;
    }

    async values() {
        if (!this.connected) await this.connect();
        return await this.db.values;
    }

    async clear() {
        if (!this.connected) await this.connect();
        return await this.db.clear();
    }
}

export default Database;
