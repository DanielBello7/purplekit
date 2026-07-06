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
exports.dropdb = dropdb;
exports.drop = drop;
const print_1 = require("../libs/print");
const config_1 = require("../config");
const sanitize_1 = require("../libs/sanitize");
const get_commands_1 = require("../libs/get-commands");
const create_ds_1 = require("../libs/create-ds");
/**
 * Drops a database if it exists.
 *
 * @param name - Database name to drop (expected to be sanitized).
 * @returns Whether the drop succeeded; includes `error` on failure.
 */
function drop(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const ds = (0, create_ds_1.createDataSource)();
        let initialized = false;
        try {
            const command = (0, get_commands_1.getDropDbCommand)(name);
            yield ds.initialize();
            initialized = true;
            yield ds.query(command);
            return { dropped: true };
        }
        catch (e) {
            const err = e instanceof Error ? e.message : 'Unable to serialize err';
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
 * CLI handler for the `dropdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
function dropdb(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const name = (0, sanitize_1.sanitize)((_a = args.name) !== null && _a !== void 0 ? _a : config_1.cfg.DATABASE_NAME);
        try {
            const response = yield drop(name);
            const msg = response.dropped
                ? `Database '${name}' dropped successfully`
                : `Couldn't drop Database '${name}'`;
            (0, print_1.print)(msg);
        }
        catch (e) {
            const err = e instanceof Error ? e.message : 'Unable to serialize err';
            (0, print_1.printf)(`Error dropping '${name}': ${err}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=dropdb.js.map