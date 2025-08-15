"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class FeatureFlagService {
    constructor(adapter, defaultEnv = "prod", cacheTtl = 60 // seconds
    ) {
        this.adapter = adapter;
        this.defaultEnv = defaultEnv;
        this.cacheTtl = cacheTtl;
        this.cache = new node_cache_1.default({ stdTTL: cacheTtl });
    }
    /**
     * Check if a feature flag is enabled.
     * @param key - Flag key
     * @param env - Environment (defaults to defaultEnv)
     * @param refresh - Bypass cache and fetch fresh value
     */
    async isEnabled(key, env, refresh = false) {
        var _a;
        const environment = env || this.defaultEnv;
        const cacheKey = `${environment}:${key}`;
        let flag;
        if (!refresh) {
            flag = this.cache.get(cacheKey);
        }
        if (!flag) {
            flag = await this.adapter.getFlag(key, environment);
            if (flag) {
                this.cache.set(cacheKey, flag, this.cacheTtl);
            }
        }
        return (_a = flag === null || flag === void 0 ? void 0 : flag.enabled) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * Get all flags for an environment.
     * Uses cache per environment.
     */
    async getAllFlags(env, refresh = false) {
        const environment = env || this.defaultEnv;
        const cacheKey = `allFlags:${environment}`;
        let flags;
        if (!refresh) {
            flags = this.cache.get(cacheKey);
        }
        if (!flags) {
            flags = await this.adapter.getAllFlags(environment);
            this.cache.set(cacheKey, flags, this.cacheTtl);
        }
        return flags;
    }
    /**
     * Upsert a flag and update the cache.
     */
    async setFlag(flag) {
        await this.adapter.upsertFlag(flag);
        const cacheKey = `${flag.environment}:${flag.key}`;
        this.cache.set(cacheKey, flag, this.cacheTtl);
        // Also refresh the environment cache
        const envCacheKey = `allFlags:${flag.environment}`;
        const allFlags = await this.adapter.getAllFlags(flag.environment);
        this.cache.set(envCacheKey, allFlags, this.cacheTtl);
    }
    /**
     * Delete a flag and remove it from cache.
     */
    async deleteFlag(key, env) {
        const environment = env || this.defaultEnv;
        await this.adapter.deleteFlag(key, environment);
        const cacheKey = `${environment}:${key}`;
        this.cache.del(cacheKey);
        // Refresh environment cache
        const envCacheKey = `allFlags:${environment}`;
        const allFlags = await this.adapter.getAllFlags(environment);
        this.cache.set(envCacheKey, allFlags, this.cacheTtl);
    }
}
exports.FeatureFlagService = FeatureFlagService;
