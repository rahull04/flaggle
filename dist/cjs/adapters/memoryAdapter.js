"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryAdapter = void 0;
class MemoryAdapter {
    constructor() {
        this.flags = [];
    }
    async init() {
        // No setup needed for in-memory storage
    }
    async getFlag(key, env) {
        return this.flags.find((f) => f.key === key && f.environment === env);
    }
    async getAllFlags(env) {
        return this.flags.filter((f) => f.environment === env);
    }
    async upsertFlag(flag) {
        const idx = this.flags.findIndex((f) => f.key === flag.key && f.environment === flag.environment);
        if (idx > -1)
            this.flags[idx] = flag;
        else
            this.flags.push(flag);
    }
    async deleteFlag(key, env) {
        this.flags = this.flags.filter((f) => !(f.key === key && f.environment === env));
    }
}
exports.MemoryAdapter = MemoryAdapter;
