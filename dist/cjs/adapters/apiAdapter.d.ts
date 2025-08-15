import { FeatureFlagAdapter } from "../FeatureFlagAdapter";
export declare class ApiAdapter implements FeatureFlagAdapter {
    private baseUrl;
    constructor(baseUrl: string);
    init(): Promise<void>;
    getFlag(key: string, env: string): Promise<any>;
    getAllFlags(env: string): Promise<any>;
    upsertFlag(): Promise<void>;
    deleteFlag(): Promise<void>;
}
