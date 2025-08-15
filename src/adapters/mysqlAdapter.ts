import { createPool, Pool } from "mysql2/promise";
import { FeatureFlag, FeatureFlagAdapter } from "../FeatureFlagAdapter";

export class MySQLAdapter implements FeatureFlagAdapter {
  private pool: Pool;

  constructor(
    config: any,
    private tableName: string = "feature_flags",
    private autoMigrate: boolean = true
  ) {
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

      const [rows] = await this.pool.query(
        `SELECT COUNT(*) AS count FROM \`${this.tableName}\``
      );
      if ((rows as any)[0].count === 0) {
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

  async getFlag(key: string, env: string) {
    const [rows] = await this.pool.query(
      `SELECT * FROM \`${this.tableName}\` WHERE \`key\` = ? AND environment = ? LIMIT 1`,
      [key, env]
    );
    return (rows as any).length ? this.mapRow((rows as any)[0]) : undefined;
  }

  async getAllFlags(env: string) {
    const [rows] = await this.pool.query(
      `SELECT * FROM \`${this.tableName}\` WHERE environment = ?`,
      [env]
    );
    return (rows as any).map(this.mapRow);
  }

  async upsertFlag(flag: FeatureFlag) {
    await this.pool.query(
      `INSERT INTO \`${this.tableName}\` (\`key\`, enabled, environment, description, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), description = VALUES(description), updated_at = VALUES(updated_at)`,
      [
        flag.key,
        flag.enabled,
        flag.environment,
        flag.description || null,
        flag.updatedAt,
      ]
    );
  }

  async deleteFlag(key: string, env: string) {
    await this.pool.query(
      `DELETE FROM \`${this.tableName}\` WHERE \`key\` = ? AND environment = ?`,
      [key, env]
    );
  }

  private mapRow(row: any): FeatureFlag {
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
