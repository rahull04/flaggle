import NodeCache from "node-cache";
export class FeatureFlagService {
    constructor(adapter, defaultEnv = "prod", cacheTtl = 60) {
        this.adapter = adapter;
        this.defaultEnv = defaultEnv;
        this.cacheTtl = cacheTtl;
        this.cache = new NodeCache({ stdTTL: cacheTtl });
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
