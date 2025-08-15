import { createPool } from "mysql2/promise";
export class MySQLAdapter {
    constructor(config, tableName = "feature_flags", autoMigrate = true) {
        this.tableName = tableName;
        this.autoMigrate = autoMigrate;
        this.pool = createPool(config);
    }
    async init() {
        if (this.autoMigrate) {
            await this.pool.query(`
        CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          \`key\` VARCHAR(255) NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT false,
          environment VARCHAR(255) NOT NULL,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_flag (\`key\`, environment)
        )
      `);
            const [rows] = await this.pool.query(`SELECT COUNT(*) AS count FROM \`${this.tableName}\``);
            if (rows[0].count === 0) {
                await this.upsertFlag({
                    id: "1",
                    key: "new-dashboard",
                    enabled: true,
                    environment: "dev",
                    description: "Enables the new dashboard UI",
                    updatedAt: new Date(),
                });
            }
        }
    }
    async getFlag(key, env) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${this.tableName}\` WHERE \`key\` = ? AND environment = ? LIMIT 1`, [key, env]);
        return rows.length ? this.mapRow(rows[0]) : undefined;
    }
    async getAllFlags(env) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${this.tableName}\` WHERE environment = ?`, [env]);
        return rows.map(this.mapRow);
    }
    async upsertFlag(flag) {
        await this.pool.query(`INSERT INTO \`${this.tableName}\` (\`key\`, enabled, environment, description, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), description = VALUES(description), updated_at = VALUES(updated_at)`, [
            flag.key,
            flag.enabled,
            flag.environment,
            flag.description || null,
            flag.updatedAt,
        ]);
    }
    async deleteFlag(key, env) {
        await this.pool.query(`DELETE FROM \`${this.tableName}\` WHERE \`key\` = ? AND environment = ?`, [key, env]);
    }
    mapRow(row) {
        return {
            id: row.id,
            key: row.key,
            enabled: !!row.enabled,
            environment: row.environment,
            description: row.description || undefined,
            updatedAt: new Date(row.updated_at),
        };
    }
}
