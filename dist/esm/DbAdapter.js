import { PostgresAdapter } from "./adapters/postgresAdapter";
import { MySQLAdapter } from "./adapters/mysqlAdapter";
import { MongoAdapter } from "./adapters/mongoAdapter";
import { Pool } from "pg";
export class DbAdapter {
    constructor(connectionString, options = {}) {
        this.connectionString = connectionString;
        this.options = options;
    }
    async init() {
        var _a, _b, _c;
        if (this.connectionString.startsWith("postgres://")) {
            try {
                require.resolve("pg");
            }
            catch {
                throw new Error(`Postgres driver not installed. Run:\n  npm install pg`);
            }
            const pool = new Pool({ connectionString: this.connectionString });
            this.adapter = new PostgresAdapter(pool, this.options.tableName, (_a = this.options.autoMigrate) !== null && _a !== void 0 ? _a : true);
        }
        else if (this.connectionString.startsWith("mysql://")) {
            try {
                require.resolve("mysql2");
            }
            catch {
                throw new Error(`MySQL driver not installed. Run:\n  npm install mysql2`);
            }
            const { createPool } = require("mysql2/promise");
            const pool = createPool({ uri: this.connectionString });
            this.adapter = new MySQLAdapter(pool, this.options.tableName, (_b = this.options.autoMigrate) !== null && _b !== void 0 ? _b : true);
        }
        else if (this.connectionString.startsWith("mongodb://") ||
            this.connectionString.startsWith("mongodb+srv://")) {
            try {
                require.resolve("mongodb");
            }
            catch {
                throw new Error(`MongoDB driver not installed. Run:\n  npm install mongodb`);
            }
            this.adapter = new MongoAdapter(this.connectionString, this.options.tableName, undefined, (_c = this.options.autoMigrate) !== null && _c !== void 0 ? _c : true);
        }
        else {
            throw new Error(`Unsupported DB type for connection string: ${this.connectionString}`);
        }
        await this.adapter.init();
    }
    getFlag(key, env) {
        return this.adapter.getFlag(key, env);
    }
    getAllFlags(env) {
        return this.adapter.getAllFlags(env);
    }
    upsertFlag(flag) {
        return this.adapter.upsertFlag(flag);
    }
    deleteFlag(key, env) {
        return this.adapter.deleteFlag(key, env);
    }
}
