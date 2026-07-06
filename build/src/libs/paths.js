"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMigrationFile = getMigrationFile;
exports.getMigrationLocation = getMigrationLocation;
exports.getMigrationRoot = getMigrationRoot;
const config_1 = require("../config");
const path_1 = __importDefault(require("path"));
/**
 * Returns the opinionated migrations root used by TGX.
 *
 * @returns Configured migrations directory.
 */
function getMigrationRoot() {
    return config_1.cfg.MIGRATIONS_DIR;
}
/**
 * Builds the canonical `migration.ts` path for a migration folder name.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Path to that migration's `migration.ts` file.
 */
function getMigrationFile(name) {
    return path_1.default.join(getMigrationRoot(), name, 'migration.ts');
}
/**
 * Returns the file location where a generated migration should be saved.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Generated migration file location.
 */
function getMigrationLocation(name) {
    return getMigrationFile(name);
}
//# sourceMappingURL=paths.js.map