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
exports.cfg = void 0;
const constants_1 = require("./constants");
const node_module_1 = require("node:module");
const node_fs_1 = require("node:fs");
const path = __importStar(require("node:path"));
const requireConfig = (0, node_module_1.createRequire)(path.join(process.cwd(), 'tgx.config.cjs'));
const defaults = {
    ENTITIES: ['src/**/*.schema.ts'],
    SEEDS: [],
    TYPE: 'postgres',
    SSL_MODE: false,
    SSL_TYPE: 'light',
    DATABASE_CA_CERT: './',
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: 5432,
    DATABASE_USERNAME: 'postgres',
    DATABASE_PASSWORD: '',
    DATABASE_NAME: 'app',
    SYNCHRONIZE: false,
    LOGGING: false,
    INITIAL_DATABASE: 'postgres',
};
/**
 * Loads the user-authored TGX config from the opinionated project config path.
 * Supports TypeScript and JavaScript config files and returns an empty object
 * when no config file has been initialized yet.
 *
 * @returns Partial user config to merge over defaults.
 */
function loadUserConfig() {
    var _a;
    for (const file of [constants_1.TGX_CONFIG_TS, constants_1.TGX_CONFIG_JS]) {
        const location = path.resolve(process.cwd(), file);
        if (!(0, node_fs_1.existsSync)(location))
            continue;
        const mod = requireConfig(location);
        return (_a = mod.default) !== null && _a !== void 0 ? _a : mod;
    }
    return {};
}
const userConfig = loadUserConfig();
const cfg = Object.assign(Object.assign(Object.assign({}, defaults), userConfig), { ROOT: constants_1.TGX_ROOT, MIGRATIONS_DIR: constants_1.TGX_MIGRATIONS_DIR, SEEDS_DIR: constants_1.TGX_SEEDS_DIR, MIGRATIONS: [constants_1.TGX_MIGRATIONS_GLOB] });
exports.cfg = cfg;
//# sourceMappingURL=index.js.map