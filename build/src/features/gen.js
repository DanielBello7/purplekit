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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSchemaChanges = exports.saveMig = exports.getMetadata = exports.compareMig = exports.genMig = exports.generate = exports.gen = void 0;
const typeorm_extension_1 = require("typeorm-extension");
const create_ds_1 = require("../libs/create-ds");
const print_1 = require("../libs/print");
const config_1 = require("../config");
const sanitize_1 = require("../libs/sanitize");
const compare_mig_1 = require("../libs/compare-mig");
Object.defineProperty(exports, "compareMig", { enumerable: true, get: function () { return compare_mig_1.compareMig; } });
const migrate_1 = require("./migrate");
const prettier_1 = __importDefault(require("prettier"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const paths_1 = require("../libs/paths");
/**
 * Detects pending schema changes by diffing entities against the database.
 *
 * @param ds - Initialized TypeORM data source.
 * @returns Whether up or down migration queries would be generated.
 */
const hasSchemaChanges = (ds) => __awaiter(void 0, void 0, void 0, function* () {
    const builder = ds.driver.createSchemaBuilder();
    const sqlInMemory = yield builder.log();
    const val = sqlInMemory.upQueries.length > 0 || sqlInMemory.downQueries.length > 0;
    return val;
});
exports.hasSchemaChanges = hasSchemaChanges;
/**
 * Generates a migration preview from an initialized data source and formats it.
 *
 * @param ds - Initialized TypeORM data source to diff against.
 * @param name - Migration class/name prefix.
 * @param timestamp - Timestamp suffix TypeORM uses in the migration class.
 * @returns Generated source, formatted source, and whether schema changes exist.
 */
const genMig = (ds, name, timestamp) => __awaiter(void 0, void 0, void 0, function* () {
    const hasChanges = yield hasSchemaChanges(ds);
    const result = yield (0, typeorm_extension_1.generateMigration)({
        name,
        timestamp,
        dataSource: ds,
        preview: true,
    });
    const formatted = yield prettier_1.default.format(result.content, {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
    });
    return {
        content: result.content,
        formatted,
        hasChanges,
    };
});
exports.genMig = genMig;
/**
 * Persists a generated migration file, creating its parent folder first.
 *
 * @param location - Destination `migration.ts` path.
 * @param content - TypeScript migration source to write.
 */
const saveMig = (location, content) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs.promises.mkdir(path.dirname(location), { recursive: true });
    yield fs.promises.writeFile(location, content);
    return void 0;
});
exports.saveMig = saveMig;
/**
 * Builds the generated migration name and location metadata.
 *
 * @param name - Optional migration name prefix; defaults to `Mig`.
 * @returns Timestamped filename, TypeORM migration name, and target file path.
 */
const getMetadata = (name) => {
    const timestamp = Date.now();
    const migrationName = name !== null && name !== void 0 ? name : `Mig`;
    const filename = `${migrationName}${timestamp}`;
    const location = (0, paths_1.getMigrationLocation)(filename);
    return {
        location,
        filename,
        migrationName,
        timestamp,
    };
};
exports.getMetadata = getMetadata;
/**
 * Generates a migration file from current entity schemas.
 *
 * @param params - Generation options including target database, force flag,
 * migration name prefix, and whether to save the file.
 * @returns Generation outcome including title and whether changes were found.
 */
const generate = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (params = {}) {
    var _a;
    let initialized = false;
    const ds = (0, create_ds_1.createDataSource)(params.db ? { database: params.db } : {});
    const metadata = getMetadata(params.name);
    try {
        yield ds.initialize();
        initialized = true;
        const generated = yield genMig(ds, metadata.migrationName, metadata.timestamp);
        if (!generated.hasChanges && !params.force) {
            return {
                generated: false,
                more: {
                    reason: 'no-changes',
                    timestamp: metadata.timestamp,
                    title: metadata.filename,
                    saved: false,
                    location: metadata.location,
                },
            };
        }
        const dialect = (0, compare_mig_1.getParserDialect)(config_1.cfg.TYPE);
        const existing = yield (0, migrate_1.getMigrationFiles)();
        const duplicate = yield (0, compare_mig_1.compareMig)(generated.content, existing, dialect);
        if (duplicate) {
            return {
                generated: false,
                more: {
                    location: metadata.location,
                    reason: 'duplicate-found',
                    timestamp: metadata.timestamp,
                    saved: false,
                    title: metadata.filename,
                    duplicateOf: duplicate.name,
                },
            };
        }
        if (params.save) {
            yield saveMig(metadata.location, generated.formatted);
        }
        return {
            generated: true,
            more: {
                location: metadata.location,
                saved: (_a = params.save) !== null && _a !== void 0 ? _a : false,
                timestamp: metadata.timestamp,
                title: metadata.filename,
                content: generated.formatted,
            },
        };
    }
    catch (e) {
        const err = e instanceof Error ? e.message : JSON.stringify(e);
        throw new Error(err);
    }
    finally {
        if (initialized) {
            yield ds.destroy();
        }
    }
});
exports.generate = generate;
/**
 * CLI handler for the `gen` command.
 *
 * @param args - CLI options for migration name and force flag.
 */
const gen = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const database = (0, sanitize_1.sanitize)(config_1.cfg.DATABASE_NAME);
    const name = args.name ? (0, sanitize_1.sanitize)(args.name) : undefined;
    try {
        (0, print_1.print)(`Generating migration for ${database}...`);
        const response = yield generate({
            db: database,
            force: args.force,
            name: name,
            save: true,
        });
        if (!response.generated) {
            if (response.more.reason === 'no-changes') {
                (0, print_1.print)('No schema changes detected — skipping migration generation');
            }
            else if (response.more.reason === 'duplicate-found') {
                (0, print_1.printf)(`Duplicate migration found: ${response.more.duplicateOf}`);
            }
            else
                throw new Error('Unknown generated response');
        }
        else {
            (0, print_1.print)(`Migration for ${database} created successfully: ${response.more.title}`);
        }
        process.exit(0);
    }
    catch (e) {
        const err = e instanceof Error ? e.message : JSON.stringify(e);
        (0, print_1.printf)(`Migration generation failed: ${err}`);
        process.exit(1);
    }
});
exports.gen = gen;
//# sourceMappingURL=gen.js.map