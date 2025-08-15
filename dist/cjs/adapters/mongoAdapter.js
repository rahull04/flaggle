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
exports.MongoAdapter = void 0;
class MongoAdapter {
    constructor(uri, dbName = "feature_flags_db", collectionName = "flaggle", autoMigrate = true) {
        this.uri = uri;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.autoMigrate = autoMigrate;
    }
    async init() {
        const { MongoClient } = await Promise.resolve().then(() => __importStar(require("mongodb")));
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        this.collection = this.db.collection(this.collectionName);
        if (this.autoMigrate) {
            const count = await this.collection.countDocuments();
            if (count === 0) {
                await this.collection.insertMany([
                    {
                        key: "new-dashboard",
                        enabled: true,
                        environment: "dev",
                        description: "Enables the new dashboard UI",
                        updatedAt: new Date(),
                    },
                    {
                        key: "beta-api",
                        enabled: false,
                        environment: "dev",
                        description: "Enables beta API endpoints",
                        updatedAt: new Date(),
                    },
                ]);
            }
        }
    }
    async getFlag(key, env) {
        return (await this.collection.findOne({ key, environment: env }));
    }
    async getAllFlags(env) {
        return (await this.collection
            .find({ environment: env })
            .toArray());
    }
    async upsertFlag(flag) {
        await this.collection.updateOne({ key: flag.key, environment: flag.environment }, { $set: flag }, { upsert: true });
    }
    async deleteFlag(key, env) {
        await this.collection.deleteOne({ key, environment: env });
    }
}
exports.MongoAdapter = MongoAdapter;
