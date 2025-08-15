"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class FeatureFlagService {
    constructor(adapter, defaultEnv = "prod", cacheTtl = 60) {
        this.adapter = adapter;
        this.defaultEnv = defaultEnv;
        this.cacheTtl = cacheTtl;
        this.cache = new node_cache_1.default({ stdTTL: cacheTtl });
    }
    async isEnabled(key, env) {
        var _a;
        const environment = env || this.defaultEnv;
        const cacheKey = `${environment}:${key}`;
        let flag = this.cache.get(cacheKey);
        if (!flag) {
            flag = await this.adapter.getFlag(key, environment);
            if (flag)
                this.cache.set(cacheKey, flag);
        }
        return (_a = flag === null || flag === void 0 ? void 0 : flag.enabled) !== null && _a !== void 0 ? _a : false;
    }
    async getAllFlags(env) {
        const environment = env || this.defaultEnv;
        return this.adapter.getAllFlags(environment);
    }
    async setFlag(flag) {
        await this.adapter.upsertFlag(flag);
        this.cache.set(`${flag.environment}:${flag.key}`, flag);
    }
}
exports.FeatureFlagService = FeatureFlagService;
