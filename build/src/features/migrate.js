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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
exports.runMigrationByConfig = runMigrationByConfig;
exports.runMigrationByName = runMigrationByName;
exports.getMigrationsToRun = getMigrationsToRun;
exports.hasMigration = hasMigration;
exports.getMigrationFiles = getMigrationFiles;
exports.getMigrationNameFromPath = getMigrationNameFromPath;
const get_commands_1 = require("../libs/get-commands");
const create_ds_1 = require("../libs/create-ds");
const print_1 = require("../libs/print");
const sanitize_1 = require("../libs/sanitize");
const config_1 = require("../config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const paths_1 = require("../libs/paths");
/**
 * Lists migration directories under the configured migrations directory and whether each
 * contains a `migration.ts` file.
 *
 * @returns An array of {@link MigrationItem} entries, one per migration folder.
 */
function getMigrationFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const root = (0, paths_1.getMigrationRoot)();
        if (!fs.existsSync(root))
            return [];
        const entries = fs.readdirSync(root, { withFileTypes: true });
        const dirs = entries.filter((d) => d.isDirectory());
        return dirs
            .map((i) => {
            const loc = path.join(i.parentPath, i.name, 'migration.ts');
            return {
                name: i.name,
                file: loc,
                parentPath: i.parentPath,
                exists: fs.existsSync(loc),
            };
        })
            .filter((a) => a.exists);
    });
}
/**
 * Checks whether a migration has already been recorded in the database.
 * Queries the `migrations` table via a dialect-specific command.
 *
 * @param ds - Initialized TypeORM data source.
 * @param name - Migration folder name to look up.
 * @returns Whether the migration name exists in the migrations table.
 */
function hasMigration(ds, name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = (0, get_commands_1.getCheckMigrationCommand)();
            const rows = yield ds.query(command, [name]);
            const v = rows.length > 0;
            return v;
        }
        catch (e) {
            const code = typeof e === 'object' && e && 'code' in e ? e.code : undefined;
            const msg = e instanceof Error ? e.message : '';
            if (code === '42P01' ||
                msg.includes('relation "migrations" does not exist')) {
                return false;
            }
            throw e;
        }
    });
}
/**
 * Resolves which local migrations still need to run against the database.
 * Opens a data source, discovers migration folders (optionally
 * scoped to `name`), and filters out entries that are missing or already recorded.
 *
 * @param name - Optional migration folder name; when omitted, all folders are considered.
 * @param db - Optional database override for the migration lookup.
 * @returns Pending {@link MigrationItem} entries; empty when none apply.
 * @throws When the data source cannot connect or migration lookup fails.
 */
function getMigrationsToRun(name, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const ds = (0, create_ds_1.createDataSource)(db ? { database: db } : {});
        let initialized = false;
        try {
            yield ds.initialize();
            initialized = true;
            const items = new Set();
            if (name) {
                const p = (0, paths_1.getMigrationFile)(name);
                if (fs.existsSync(p)) {
                    items.add({
                        exists: true,
                        file: p,
                        name,
                        parentPath: path.dirname((0, paths_1.getMigrationFile)(name)),
                    });
                }
            }
            else {
                const files = yield getMigrationFiles();
                files.forEach((f) => items.add(f));
            }
            const a = yield Promise.all(Array.from(items).map((f) => __awaiter(this, void 0, void 0, function* () {
                return Object.assign(Object.assign({}, f), { isMigrated: yield hasMigration(ds, f.name) });
            })));
            return a
                .filter((f) => f.exists && !f.isMigrated)
                .map((_a) => {
                var { isMigrated } = _a, f = __rest(_a, ["isMigrated"]);
                return f;
            });
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : JSON.stringify(e);
            throw new Error(msg);
        }
        finally {
            if (initialized) {
                yield ds.destroy();
            }
        }
    });
}
/**
 * Runs pending migrations discovered via {@link getMigrationsToRun}.
 * When `name` is omitted, runs every unmigrated folder under the configured migrations directory.
 *
 * @param name - Optional migration folder name to run a single migration.
 * @param db - Optional database override for migration discovery and execution.
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When migration discovery or execution fails.
 */
function runMigrationByName(name, db) {
    return __awaiter(this, void 0, void 0, function* () {
        let initialized = false;
        let ds = null;
        try {
            const migratable = yield getMigrationsToRun(name, db);
            if (migratable.length < 1) {
                return {
                    migrated: false,
                    status: 'no-migrations',
                };
            }
            ds = (0, create_ds_1.createDataSource)(Object.assign({ migrations: migratable.map((m) => m.file) }, (db ? { database: db } : {})));
            yield ds.initialize();
            initialized = true;
            const executed = yield ds.runMigrations();
            if (executed.length < 1) {
                return {
                    migrated: false,
                    status: 'no-migrations',
                };
            }
            return {
                migrated: true,
                status: 'migrated',
            };
        }
        catch (e) {
            const parsed = e instanceof Error ? e.message : JSON.stringify(e);
            throw new Error(parsed);
        }
        finally {
            if (initialized && ds) {
                yield ds.destroy();
            }
        }
    });
}
/**
 * Runs all migrations registered on the configured TypeORM data source.
 * Initializes the data source, executes pending migrations in a single
 * transaction, then destroys the connection.
 *
 * @param db - Optional database override for the TypeORM data source.
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When initialization or migration execution fails.
 */
function runMigrationByConfig(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const ds = (0, create_ds_1.createDataSource)(db ? { database: db } : {});
        let initialized = false;
        try {
            yield ds.initialize();
            initialized = true;
            const response = yield ds.runMigrations({
                fake: false,
                transaction: 'all',
            });
            if (response.length < 1) {
                return {
                    migrated: false,
                    status: 'no-migrations',
                };
            }
            return {
                migrated: true,
                status: 'migrated',
            };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : JSON.stringify(e);
            throw new Error(msg);
        }
        finally {
            if (initialized) {
                yield ds.destroy();
            }
        }
    });
}
/**
 * Resolves a migration folder name and `migration.ts` path from a CLI path input.
 * Accepts either a migration directory or a direct path to `migration.ts`.
 * Validates that the folder name is class-style and ends with a 13-digit timestamp.
 *
 * @param input - Migration folder or file path from `--file`.
 * @returns The migration name and normalized path to `migration.ts`.
 * @throws When the name is invalid or the migration file does not exist.
 */
function getMigrationNameFromPath(input) {
    const normalized = path.normalize(input);
    const base = path.basename(normalized);
    const file = base === 'migration.ts'
        ? normalized
        : path.join(normalized, 'migration.ts');
    const migdir = path.dirname(file);
    const name = path.basename(migdir);
    const validMigName = new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d{13}$/);
    if (!validMigName.test(name)) {
        throw new Error(`Invalid migration name. Expected a class-style name ending with a 13-digit timestamp`);
    }
    if (!fs.existsSync(file)) {
        throw new Error(`Migration file doesn't exist: ${file}`);
    }
    return {
        name,
        path: file,
    };
}
/**
 * CLI handler for the `migrate` command.
 * Runs pending migrations via {@link runMigrationByName}. When `--file` is
 * provided, resolves the migration name from the path first.
 * Prints the outcome to stdout and exits with code 0 or 1.
 *
 * @param args - CLI options; `--name` scopes to one migration folder, `--file` to a folder or `migration.ts` path.
 */
function migrate(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const database = (0, sanitize_1.sanitize)((_a = args.db) !== null && _a !== void 0 ? _a : config_1.cfg.DATABASE_NAME);
        try {
            let response;
            if (args.file) {
                const result = getMigrationNameFromPath(args.file);
                response = yield runMigrationByName(result.name, database);
            }
            else {
                response = yield runMigrationByName(args.name, database);
            }
            if (response.migrated) {
                (0, print_1.print)('Migrations completed successfully.');
                process.exit(0);
            }
            (0, print_1.print)(`No migrations were run: ${response.status}.`);
            process.exit(0);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Unable to serialize error';
            (0, print_1.printf)(`Failed to run migrations: ${msg}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=migrate.js.map