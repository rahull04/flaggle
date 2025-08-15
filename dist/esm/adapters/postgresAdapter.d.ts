import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";
export declare class PostgresAdapter implements FeatureFlagAdapter {
    private pool;
    private tableName;
    private autoMigrate;
    constructor(pool: any, // will be passed from DbAdapter
    tableName?: string, autoMigrate?: boolean);
    /** Required by FeatureFlagAdapter */
    init(): Promise<void>;
    private runMigrationAndSeed;
    getFlag(key: string, env: string): Promise<FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<FeatureFlag[]>;
    upsertFlag(flag: FeatureFlag): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
    private mapRow;
}
