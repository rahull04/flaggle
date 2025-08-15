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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFlaggleApp = void 0;
const FeatureFlagService_1 = require("./FeatureFlagService");
const postgresAdapter_1 = require("./adapters/postgresAdapter");
const pg_1 = require("pg");
const expressRouter_1 = require("./expressRouter");
async function createFlaggleApp(connectionString, env = "dev") {
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new postgresAdapter_1.PostgresAdapter(pool);
    await adapter.init();
    const service = new FeatureFlagService_1.FeatureFlagService(adapter, env);
    const router = (0, expressRouter_1.createFlaggleRouter)(service);
    return { service, router };
}
exports.createFlaggleApp = createFlaggleApp;
__exportStar(require("./FeatureFlagAdapter"), exports);
__exportStar(require("./FeatureFlagService"), exports);
__exportStar(require("./adapters/memoryAdapter"), exports);
__exportStar(require("./adapters/apiAdapter"), exports);
__exportStar(require("./adapters/postgresAdapter"), exports);
__exportStar(require("./adapters/mysqlAdapter"), exports);
__exportStar(require("./adapters/mongoAdapter"), exports);
__exportStar(require("./adapters/memoryAdapter"), exports);
__exportStar(require("./expressRouter"), exports);
