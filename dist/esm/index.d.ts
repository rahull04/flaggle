/// <reference types="express" />
import { FeatureFlagService } from "./FeatureFlagService";
export declare function createFlaggleApp(connectionString: string, env?: string): Promise<{
    service: FeatureFlagService;
    router: Promise<import("express").Router>;
}>;
export * from "./FeatureFlagAdapter";
export * from "./FeatureFlagService";
export * from "./adapters/memoryAdapter";
export * from "./adapters/apiAdapter";
export * from "./adapters/postgresAdapter";
export * from "./adapters/mysqlAdapter";
export * from "./adapters/mongoAdapter";
export * from "./adapters/memoryAdapter";
