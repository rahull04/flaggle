import { FeatureFlagAdapter, FeatureFlag } from "./FeatureFlagAdapter";

export class DbAdapter implements FeatureFlagAdapter {
  private adapter!: FeatureFlagAdapter;

  constructor(
    private connectionString: string,
    private options: { tableName?: string; autoMigrate?: boolean } = {}
  ) {}

  async init() {
    if (this.connectionString.startsWith("postgres://")) {
      // dynamically import pg + adapter
      const { Pool } = await import("pg");
      const { PostgresAdapter } = await import("./adapters/postgresAdapter");

      const pool = new Pool({ connectionString: this.connectionString });
      this.adapter = new PostgresAdapter(
        pool,
        this.options.tableName,
        this.options.autoMigrate ?? true
      );
    } else if (this.connectionString.startsWith("mysql://")) {
      const { createPool } = await import("mysql2/promise");
      const { MySQLAdapter } = await import("./adapters/mysqlAdapter");

      const pool = createPool({ uri: this.connectionString });
      this.adapter = new MySQLAdapter(
        pool,
        this.options.tableName,
        this.options.autoMigrate ?? true
      );
    } else if (
      this.connectionString.startsWith("mongodb://") ||
      this.connectionString.startsWith("mongodb+srv://")
    ) {
      const { MongoClient } = await import("mongodb");
      const { MongoAdapter } = await import("./adapters/mongoAdapter");

      this.adapter = new MongoAdapter(
        this.connectionString,
        this.options.tableName,
        MongoClient as unknown as string,
        this.options.autoMigrate ?? true
      );
    } else {
      throw new Error(
        `Unsupported DB type for connection string: ${this.connectionString}`
      );
    }

    await this.adapter.init();
  }

  getFlag(key: string, env: string) {
    return this.adapter.getFlag(key, env);
  }

  getAllFlags(env: string) {
    return this.adapter.getAllFlags(env);
  }

  upsertFlag(flag: FeatureFlag) {
    return this.adapter.upsertFlag(flag);
  }

  deleteFlag(key: string, env: string) {
    return this.adapter.deleteFlag(key, env);
  }
}
