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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const config_1 = require("../config");
const constants_1 = require("../config/constants");
const print_1 = require("../libs/print");
const fs = __importStar(require("fs/promises"));
const template = `import type { TGX_CONFIGURATIONS } from 'tgx';

const config: TGX_CONFIGURATIONS = {
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

export default config;
`;
/**
 * Ensures a directory exists without failing when it is already present.
 *
 * @param path - Directory path to create.
 */
function ensureDir(path) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.mkdir(path, { recursive: true });
    });
}
/**
 * Writes a file only when it does not already exist.
 *
 * @param path - File path to create.
 * @param content - Initial file content.
 */
function ensureFile(path_1) {
    return __awaiter(this, arguments, void 0, function* (path, content = '') {
        try {
            yield fs.writeFile(path, content, { flag: 'wx' });
        }
        catch (e) {
            const err = e;
            if (err.code === 'EEXIST')
                return;
            throw e;
        }
    });
}
/**
 * Creates TGX's opinionated project structure and starter config.
 * Existing files are preserved so the command can be rerun safely.
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, print_1.print)('initializing app');
        yield ensureDir(config_1.cfg.ROOT);
        yield ensureDir(config_1.cfg.MIGRATIONS_DIR);
        yield ensureDir(config_1.cfg.SEEDS_DIR);
        yield ensureFile(`${config_1.cfg.ROOT}/.gitkeep`);
        yield ensureFile(`${config_1.cfg.MIGRATIONS_DIR}/.gitkeep`);
        yield ensureFile(`${config_1.cfg.SEEDS_DIR}/.gitkeep`);
        yield ensureFile(constants_1.TGX_CONFIG_TS, template);
        (0, print_1.print)('initialized');
    });
}
//# sourceMappingURL=init.js.map