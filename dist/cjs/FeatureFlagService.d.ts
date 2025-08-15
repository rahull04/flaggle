import { FeatureFlag, FeatureFlagAdapter } from "./FeatureFlagAdapter";
export declare class FeatureFlagService {
    private adapter;
    private defaultEnv;
    private cacheTtl;
    private cache;
    constructor(adapter: FeatureFlagAdapter, defaultEnv?: string, cacheTtl?: number);
    isEnabled(key: string, env?: string): Promise<boolean>;
    getAllFlags(env?: string): Promise<FeatureFlag[]>;
    setFlag(flag: FeatureFlag): Promise<void>;
}
