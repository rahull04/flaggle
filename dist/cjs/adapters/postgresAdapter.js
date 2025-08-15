"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
class PostgresAdapter {
    constructor(pool, // will be passed from DbAdapter
    tableName = "flaggle", autoMigrate = true) {
        this.pool = pool;
        this.tableName = tableName;
        this.autoMigrate = autoMigrate;
    }
    /** Required by FeatureFlagAdapter */
    async init() {
        if (this.autoMigrate) {
            await this.runMigrationAndSeed();
        }
    }
    async runMigrationAndSeed() {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT false,
        environment TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(key, environment)
      );
    `;
        await this.pool.query(createTableQuery);
        const { rows } = await this.pool.query(`SELECT COUNT(*) AS count FROM ${this.tableName}`);
        if (parseInt(rows[0].count, 10) === 0) {
            console.log(`[PostgresAdapter] Table empty — inserting default feature flags...`);
            const seedFlags = [
                {
                    id: "1",
                    key: "new-dashboard",
                    enabled: true,
                    environment: "dev",
                    description: "Enables the new dashboard UI",
                    updatedAt: new Date(),
                },
                {
                    id: "2",
                    key: "beta-api",
                    enabled: false,
                    environment: "dev",
                    description: "Enables beta version of API endpoints",
                    updatedAt: new Date(),
                },
            ];
            for (const flag of seedFlags) {
                await this.upsertFlag(flag);
            }
            console.log(`[PostgresAdapter] Default feature flags seeded successfully.`);
        }
    }
    async getFlag(key, env) {
        const query = `SELECT * FROM ${this.tableName} WHERE key = $1 AND environment = $2 LIMIT 1`;
        const { rows } = await this.pool.query(query, [key, env]);
        return rows.length ? this.mapRow(rows[0]) : undefined;
    }
    async getAllFlags(env) {
        const query = `SELECT * FROM ${this.tableName} WHERE environment = $1`;
        const { rows } = await this.pool.query(query, [env]);
        return rows.map(this.mapRow);
    }
    async upsertFlag(flag) {
        const query = `
      INSERT INTO ${this.tableName} (key, enabled, environment, description, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (key, environment)
      DO UPDATE SET enabled = $2, description = $4, updated_at = $5
    `;
        await this.pool.query(query, [
            flag.key,
            flag.enabled,
            flag.environment,
            flag.description || null,
            flag.updatedAt,
        ]);
    }
    async deleteFlag(key, env) {
        const query = `DELETE FROM ${this.tableName} WHERE key = $1 AND environment = $2`;
        await this.pool.query(query, [key, env]);
    }
    mapRow(row) {
        return {
            id: row.id,
            key: row.key,
            enabled: row.enabled,
            environment: row.environment,
            description: row.description || undefined,
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.PostgresAdapter = PostgresAdapter;
