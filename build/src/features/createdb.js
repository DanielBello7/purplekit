"use strict";
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
exports.createdb = createdb;
exports.create = create;
const get_commands_1 = require("../libs/get-commands");
const config_1 = require("../config");
const print_1 = require("../libs/print");
const sanitize_1 = require("../libs/sanitize");
const create_ds_1 = require("../libs/create-ds");
/**
 * Creates a database if it does not already exist.
 * Idempotent — safe to run multiple times with the same name.
 *
 * @param name - Database name to create (expected to be sanitized).
 * @returns Outcome status and whether the database was created.
 */
function create(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const ds = (0, create_ds_1.createDataSource)();
        let initialized = false;
        try {
            const createCommand = (0, get_commands_1.getCreateDbCommand)(name);
            const checksCommand = (0, get_commands_1.getDbCheckCommand)();
            yield ds.initialize();
            initialized = true;
            const rs = yield ds.query(checksCommand, [name]);
            const exists = rs.length > 0;
            if (!exists) {
                yield ds.query(createCommand);
                return { status: 'created', created: true };
            }
            else {
                return { status: 'already-exists', created: false };
            }
        }
        catch (e) {
            const err = e instanceof Error ? e.message : 'Unable to serialize error';
            throw new Error(err);
        }
        finally {
            if (initialized) {
                yield ds.destroy();
            }
        }
    });
}
/**
 * CLI handler for the `createdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
function createdb(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const name = (0, sanitize_1.sanitize)((_a = args.name) !== null && _a !== void 0 ? _a : config_1.cfg.DATABASE_NAME);
        try {
            const response = yield create(name);
            if (response.status === 'created') {
                (0, print_1.print)(`Database '${name}' created successfully`);
            }
            else
                (0, print_1.print)(`Database '${name}' already exists`);
        }
        catch (e) {
            const err = e instanceof Error ? e.message : 'Unable to serialize error';
            (0, print_1.printf)(`Error creating database '${name}': ${err}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=createdb.js.map