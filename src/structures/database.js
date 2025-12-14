import { JoshProvider } from '@joshdb/json';
import { Josh } from '@joshdb/core';
import path from 'path';
class Database {
    provider;
    db;
    connected;
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
        if (this.connected)
            return;
        this.db = new Josh({
            name: 'main',
            provider: this.provider
        });
        await this.db.defer;
        this.connected = true;
    }
    async get(key, defaultValue = null) {
        if (!this.connected)
            await this.connect();
        try {
            const value = await this.db.get(key);
            return value !== undefined && value !== null ? value : defaultValue;
        }
        catch (error) {
            return defaultValue;
        }
    }
    async set(key, value) {
        if (!this.connected)
            await this.connect();
        return await this.db.set(key, value);
    }
    async delete(key) {
        if (!this.connected)
            await this.connect();
        return await this.db.delete(key);
    }
    async has(key) {
        if (!this.connected)
            await this.connect();
        return await this.db.has(key);
    }
    async all() {
        if (!this.connected)
            await this.connect();
        const keys = await this.db.keys;
        const result = [];
        for (const key of keys) {
            const value = await this.db.get(key);
            result.push({ ID: key, data: value });
        }
        return result;
    }
    async keys() {
        if (!this.connected)
            await this.connect();
        return await this.db.keys;
    }
    async values() {
        if (!this.connected)
            await this.connect();
        return await this.db.values;
    }
    async clear() {
        if (!this.connected)
            await this.connect();
        return await this.db.clear();
    }
    async push(key, value) {
        if (!this.connected)
            await this.connect();
        try {
            const current = await this.db.get(key);
            if (Array.isArray(current)) {
                const updated = [...current, value];
                await this.db.set(key, updated);
            } else {
                await this.db.set(key, [value]);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async pull(key, value) {
        if (!this.connected)
            await this.connect();
        try {
            const current = await this.db.get(key);
            if (Array.isArray(current)) {
                const filtered = current.filter(item => item !== value);
                await this.db.set(key, filtered);
                return true;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
}
export default Database;
//# sourceMappingURL=database.js.map