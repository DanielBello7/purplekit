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
exports.migration = migration;
exports.apply = apply;
exports.removeMig = removeMig;
const gen_1 = require("./gen");
const config_1 = require("../config");
const migrate_1 = require("./migrate");
const sanitize_1 = require("../libs/sanitize");
const print_1 = require("../libs/print");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Removes a generated migration folder from a `migration.ts` file location.
 *
 * @param location - Generated migration file path.
 */
function removeMig(location) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.rm(path.dirname(location), {
            force: true,
            recursive: true,
        });
    });
}
/**
 * Generates a migration and immediately applies it to the configured database.
 * The generated file is removed when execution fails or no migration runs.
 *
 * @param all - Whether to run all configured migrations instead of only the new one.
 * @returns Result describing whether generation and application succeeded.
 */
function apply(all) {
    return __awaiter(this, void 0, void 0, function* () {
        // generate migration files
        const database = (0, sanitize_1.sanitize)(config_1.cfg.DATABASE_NAME);
        const response = yield (0, gen_1.generate)({ db: database, save: false });
        if (!response.generated) {
            return {
                applied: false,
                generated: false,
                msg: response.more.reason === 'duplicate-found'
                    ? `Duplicate migration found: ${response.more.duplicateOf}.`
                    : 'No schema changes detected. Migration generation skipped.',
            };
        }
        yield (0, gen_1.saveMig)(response.more.location, response.more.content);
        try {
            const ans = all
                ? yield (0, migrate_1.runMigrationByConfig)(database)
                : yield (0, migrate_1.runMigrationByName)(response.more.title, database);
            if (!ans.migrated) {
                yield removeMig(response.more.location);
                return {
                    generated: true,
                    applied: false,
                    msg: 'No migrations were run.',
                };
            }
            return {
                generated: true,
                applied: true,
                msg: 'Migration completed successfully.',
            };
        }
        catch (e) {
            yield removeMig(response.more.location);
            throw e;
        }
    });
}
/**
 * CLI handler for the `migration` command.
 *
 * @param args - Command options, including whether to run all migrations.
 */
function migration(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield apply(args.all);
            if (!response.applied)
                (0, print_1.printf)(response.msg);
            else
                (0, print_1.print)(response.msg);
            process.exit(0);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : JSON.stringify(e);
            (0, print_1.printf)(`Failed to apply migration: ${msg}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=migration.js.map