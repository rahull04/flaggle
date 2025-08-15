import { FeatureFlagAdapter, FeatureFlag } from "./FeatureFlagAdapter";
export declare class DbAdapter implements FeatureFlagAdapter {
    private connectionString;
    private options;
    private adapter;
    constructor(connectionString: string, options?: {
        tableName?: string;
        autoMigrate?: boolean;
    });
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<FeatureFlag[]>;
    upsertFlag(flag: FeatureFlag): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
}
