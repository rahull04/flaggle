import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";
export declare class MySQLAdapter implements FeatureFlagAdapter {
    private tableName;
    private autoMigrate;
    private pool;
    constructor(config: any, tableName?: string, autoMigrate?: boolean);
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<any>;
    upsertFlag(flag: FeatureFlag): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
    private mapRow;
}
