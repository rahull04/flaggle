import { FeatureFlagAdapter } from "./FeatureFlagAdapter";
export declare class DbAdapter implements FeatureFlagAdapter {
    private connectionString;
    private options;
    private adapter;
    constructor(connectionString: string, options?: {
        tableName?: string;
        autoMigrate?: boolean;
    });
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<import("./FeatureFlagAdapter").FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<import("./FeatureFlagAdapter").FeatureFlag[]>;
    upsertFlag(flag: any): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
}
