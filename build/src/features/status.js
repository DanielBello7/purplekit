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
exports.checkForDuplicateMig = exports.migrationStatus = exports.doesDbExists = exports.dbStatus = exports.status = void 0;
const get_commands_1 = require("../libs/get-commands");
const create_ds_1 = require("../libs/create-ds");
const print_1 = require("../libs/print");
const config_1 = require("../config");
const sanitize_1 = require("../libs/sanitize");
const migrate_1 = require("./migrate");
const compare_mig_1 = require("../libs/compare-mig");
const fs = __importStar(require("fs/promises"));
/**
 * Splits local migration files into applied and pending groups for a database.
 *
 * @param name - Optional target database name.
 * @returns Applied and pending local migration file metadata.
 */
const migrationStatus = (name) => __awaiter(void 0, void 0, void 0, function* () {
    let initialized = false;
    const ds2 = (0, create_ds_1.createDataSource)(name ? { database: name } : {});
    try {
        yield ds2.initialize();
        initialized = true;
        const migrations = yield (0, migrate_1.getMigrationFiles)();
        const applied = [];
        const pending = [];
        const response = yield Promise.all(migrations.map((m) => __awaiter(void 0, void 0, void 0, function* () {
            const hasRun = yield (0, migrate_1.hasMigration)(ds2, m.name);
            return Object.assign(Object.assign({}, m), { hasRun });
        })));
        for (const m of response) {
            const { hasRun } = m, rest = __rest(m, ["hasRun"]);
            if (hasRun)
                applied.push(rest);
            else
                pending.push(rest);
        }
        return { applied, pending };
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : JSON.stringify(e);
        throw new Error(msg);
    }
    finally {
        if (initialized) {
            yield ds2.destroy();
        }
    }
});
exports.migrationStatus = migrationStatus;
/**
 * Detects local migration files with equivalent normalized `up` SQL.
 *
 * @returns Total migration file count and duplicate matches.
 */
const checkForDuplicateMig = () => __awaiter(void 0, void 0, void 0, function* () {
    const results = [];
    const dialect = (0, compare_mig_1.getParserDialect)(config_1.cfg.TYPE);
    const files = yield (0, migrate_1.getMigrationFiles)();
    for (const i of files) {
        const existing = files.filter((m) => i.name !== m.name);
        const data = yield fs.readFile(i.file, { encoding: 'utf-8' });
        const resp = yield (0, compare_mig_1.compareMig)(data, existing, dialect);
        if (resp)
            results.push(Object.assign({ duplicateOf: resp }, i));
        else
            continue;
    }
    return {
        total: files.length,
        checks: results,
    };
});
exports.checkForDuplicateMig = checkForDuplicateMig;
/**
 * Checks whether a database with the given name exists.
 * Connects via the default data source and runs a dialect-specific query.
 *
 * @param name - Database name to check (expected to be sanitized).
 * @returns Whether the database exists; includes `error` when the check fails.
 */
const doesDbExists = (name) => __awaiter(void 0, void 0, void 0, function* () {
    let initialized = false;
    // this datasource connects to the postgres because that always exists so it actually doesn't need
    // a db pass onto its object
    const ds = (0, create_ds_1.createDataSource)();
    try {
        const command = (0, get_commands_1.getDbCheckCommand)();
        yield ds.initialize();
        initialized = true;
        const query = yield ds.query(command, [name]);
        const exists = query.length > 0;
        return {
            databaseOk: exists,
            dbName: name,
        };
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : 'unable to serialize error';
        throw new Error(msg);
    }
    finally {
        if (initialized) {
            yield ds.destroy();
        }
    }
});
exports.doesDbExists = doesDbExists;
/**
 * Inspects a target database and returns its public/base table count.
 * Opens a dedicated TypeORM data source pointed at `name`.
 *
 * @param db - Database to inspect.
 * @returns Table count on success; `tables: 0` and `err` on failure.
 */
const dbStatus = (db) => __awaiter(void 0, void 0, void 0, function* () {
    // target data source
    let initialized = false;
    const tds = (0, create_ds_1.createDataSource)({ database: db });
    try {
        const command = (0, get_commands_1.getDbTablesCommand)();
        yield tds.initialize();
        initialized = true;
        const response = yield tds.query(command);
        return {
            tables: response.length,
        };
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : 'Unable to serialize';
        throw new Error(msg);
    }
    finally {
        if (initialized) {
            yield tds.destroy();
        }
    }
});
exports.dbStatus = dbStatus;
/**
 * CLI handler for the `status` command.
 * Checks database existence and, if it exists, reports the table count.
 * Prints a JSON object to stdout.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
const status = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const name = (0, sanitize_1.sanitize)((_a = args.name) !== null && _a !== void 0 ? _a : config_1.cfg.DATABASE_NAME);
    try {
        let response = {};
        const exists = yield doesDbExists(name);
        if (exists.databaseOk) {
            const check = yield dbStatus(name);
            const migsCheck = yield migrationStatus(name);
            response = Object.assign(Object.assign(Object.assign(Object.assign({}, response), exists), check), { migrations: {
                    applied: migsCheck.applied.length,
                    pending: migsCheck.pending.length,
                } });
        }
        const migs = yield checkForDuplicateMig();
        response = Object.assign(Object.assign(Object.assign({}, response), exists), { migrations: Object.assign(Object.assign({}, response.migrations), { files: migs.total, duplicates: migs.checks.map((m) => ({
                    name: m.name,
                    duplicateOf: m.duplicateOf.name,
                })) }) });
        (0, print_1.print)(JSON.stringify(response, null, 2));
        process.exit(0);
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : 'Unable to Serialize';
        (0, print_1.printf)(`Error occurred: ${msg}`);
        process.exit(1);
    }
});
exports.status = status;
//# sourceMappingURL=status.js.map