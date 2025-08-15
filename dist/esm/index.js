import { FeatureFlagService } from "./FeatureFlagService";
import { PostgresAdapter } from "./adapters/postgresAdapter";
import { Pool } from "pg";
import { createFlaggleRouter } from "./expressRouter";
export async function createFlaggleApp(connectionString, env = "dev") {
    const pool = new Pool({ connectionString });
    const adapter = new PostgresAdapter(pool);
    await adapter.init();
    const service = new FeatureFlagService(adapter, env);
    const router = createFlaggleRouter(service);
    return { service, router };
}
export * from "./FeatureFlagAdapter";
export * from "./FeatureFlagService";
export * from "./adapters/memoryAdapter";
export * from "./adapters/apiAdapter";
export * from "./adapters/postgresAdapter";
export * from "./adapters/mysqlAdapter";
export * from "./adapters/mongoAdapter";
export * from "./adapters/memoryAdapter";
