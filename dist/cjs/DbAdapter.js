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
exports.DbAdapter = void 0;
const postgresAdapter_1 = require("./adapters/postgresAdapter");
const mysqlAdapter_1 = require("./adapters/mysqlAdapter");
const mongoAdapter_1 = require("./adapters/mongoAdapter");
class DbAdapter {
    constructor(connectionString, options = {}) {
        this.connectionString = connectionString;
        this.options = options;
    }
    async init() {
        var _a, _b, _c;
        if (this.connectionString.startsWith("postgres://")) {
            let { Pool } = await Promise.resolve().then(() => __importStar(require("pg"))); // dynamic import
            const pool = new Pool({ connectionString: this.connectionString });
            this.adapter = new postgresAdapter_1.PostgresAdapter(pool, this.options.tableName, (_a = this.options.autoMigrate) !== null && _a !== void 0 ? _a : true);
        }
        else if (this.connectionString.startsWith("mysql://")) {
            let { createPool } = await Promise.resolve().then(() => __importStar(require("mysql2/promise")));
            const pool = createPool({ uri: this.connectionString });
            this.adapter = new mysqlAdapter_1.MySQLAdapter(pool, this.options.tableName, (_b = this.options.autoMigrate) !== null && _b !== void 0 ? _b : true);
        }
        else if (this.connectionString.startsWith("mongodb://") ||
            this.connectionString.startsWith("mongodb+srv://")) {
            let { MongoClient } = await Promise.resolve().then(() => __importStar(require("mongodb")));
            this.adapter = new mongoAdapter_1.MongoAdapter(this.connectionString, this.options.tableName, MongoClient, (_c = this.options.autoMigrate) !== null && _c !== void 0 ? _c : true);
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
exports.DbAdapter = DbAdapter;
