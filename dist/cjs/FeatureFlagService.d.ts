import { FeatureFlag, FeatureFlagAdapter } from "./FeatureFlagAdapter";
export declare class FeatureFlagService {
    private adapter;
    private defaultEnv;
    private cacheTtl;
    private cache;
    constructor(adapter: FeatureFlagAdapter, defaultEnv?: string, cacheTtl?: number);
    /**
     * Check if a feature flag is enabled.
     * @param key - Flag key
     * @param env - Environment (defaults to defaultEnv)
     * @param refresh - Bypass cache and fetch fresh value
     */
    isEnabled(key: string, env?: string, refresh?: boolean): Promise<boolean>;
    /**
     * Get all flags for an environment.
     * Uses cache per environment.
     */
    getAllFlags(env?: string, refresh?: boolean): Promise<FeatureFlag[]>;
    /**
     * Upsert a flag and update the cache.
     */
    setFlag(flag: FeatureFlag): Promise<void>;
    /**
     * Delete a flag and remove it from cache.
     */
    deleteFlag(key: string, env?: string): Promise<void>;
}
