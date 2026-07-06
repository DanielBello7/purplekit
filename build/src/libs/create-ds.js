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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const fs = __importStar(require("fs"));
/**
 * Builds a TypeORM `DataSource` from app config, with optional overrides.
 *
 * @param opt - Partial options merged on top of defaults (e.g. `{ database: name }`).
 * @returns A configured, uninitialized TypeORM data source.
 */
const createDataSource = (opt = {}) => {
    return new typeorm_1.DataSource(Object.assign({ username: config_1.cfg.DATABASE_USERNAME, password: config_1.cfg.DATABASE_PASSWORD, host: config_1.cfg.DATABASE_HOST, port: config_1.cfg.DATABASE_PORT, type: config_1.cfg.TYPE, database: config_1.cfg.INITIAL_DATABASE, entities: config_1.cfg.ENTITIES, migrations: config_1.cfg.MIGRATIONS, ssl: config_1.cfg.SSL_MODE, extra: config_1.cfg.SSL_MODE
            ? {
                ssl: Object.assign({ rejectUnauthorized: false }, (config_1.cfg.SSL_TYPE === 'heavy'
                    ? { ca: fs.readFileSync(config_1.cfg.DATABASE_CA_CERT) }
                    : {})),
            }
            : undefined, synchronize: config_1.cfg.SYNCHRONIZE, logging: config_1.cfg.LOGGING }, opt));
};
exports.createDataSource = createDataSource;
//# sourceMappingURL=create-ds.js.map