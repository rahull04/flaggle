export interface FeatureFlag {
    id: string;
    key: string;
    enabled: boolean;
    environment: string;
    description?: string;
    updatedAt: Date;
}
export interface FeatureFlagAdapter {
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<FeatureFlag[]>;
    upsertFlag(flag: FeatureFlag): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
}
