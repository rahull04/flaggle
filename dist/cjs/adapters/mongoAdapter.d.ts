import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";
export declare class MongoAdapter implements FeatureFlagAdapter {
    private uri;
    private dbName;
    private collectionName;
    private autoMigrate;
    private client;
    private db;
    private collection;
    constructor(uri: string, dbName?: string, collectionName?: string, autoMigrate?: boolean);
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<FeatureFlag | undefined>;
    getAllFlags(env: string): Promise<FeatureFlag[]>;
    upsertFlag(flag: FeatureFlag): Promise<void>;
    deleteFlag(key: string, env: string): Promise<void>;
}
