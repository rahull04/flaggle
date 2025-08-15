"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLAdapter = void 0;
class MySQLAdapter {
    constructor(config, tableName = "flaggle", autoMigrate = true) {
        this.tableName = tableName;
        this.autoMigrate = autoMigrate;
        this.pool = config; // will be replaced in init()
    }
    /** Required by FeatureFlagAdapter */
    async init() {
        const { createPool } = await Promise.resolve().then(() => __importStar(require("mysql2/promise")));
        this.pool = createPool(this.pool); // dynamic pool creation
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
exports.MySQLAdapter = MySQLAdapter;
