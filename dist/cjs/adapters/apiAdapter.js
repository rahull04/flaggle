"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiAdapter = void 0;
class ApiAdapter {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    // Add init() to satisfy the interface
    async init() {
        // No initialization needed for API adapter
    }
    async getFlag(key, env) {
        const res = await fetch(`${this.baseUrl}/feature-flags/${env}/${key}`);
        if (!res.ok)
            return null;
        return res.json();
    }
    async getAllFlags(env) {
        const res = await fetch(`${this.baseUrl}/feature-flags/${env}`);
        return res.ok ? res.json() : [];
    }
    async upsertFlag() {
        throw new Error("Not supported in frontend");
    }
    async deleteFlag() {
        throw new Error("Not supported in frontend");
    }
}
exports.ApiAdapter = ApiAdapter;
