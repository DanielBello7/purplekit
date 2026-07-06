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
exports.seed = seed;
const config_1 = require("../config");
const create_ds_1 = require("../libs/create-ds");
const print_1 = require("../libs/print");
const sanitize_1 = require("../libs/sanitize");
const typeorm_extension_1 = require("typeorm-extension");
/**
 * Runs seed classes against a target database.
 *
 * @param seeds - Seeder classes to execute in order.
 * @param db - Optional database override; defaults to configured database.
 * @returns Whether all seeders completed successfully.
 */
function seeder(seeds, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = (0, sanitize_1.sanitize)(db !== null && db !== void 0 ? db : config_1.cfg.DATABASE_NAME);
        const ds = (0, create_ds_1.createDataSource)({ database });
        let initialized = false;
        try {
            yield ds.initialize();
            initialized = true;
            for (const seed of seeds) {
                yield (0, typeorm_extension_1.runSeeder)(ds, seed);
            }
            return true;
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
 * CLI handler for the `seed` command.
 * Populates an existing, migrated database with configured seed classes.
 *
 * @param args - Command options including an optional database override.
 */
function seed(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const seeds = config_1.cfg.SEEDS;
            const response = yield seeder(seeds, args.db);
            if (!response)
                throw new Error('unable to complete seeding');
            (0, print_1.print)('Seeding complete');
            process.exit(0);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : JSON.stringify(e);
            (0, print_1.printf)(msg);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=seed.js.map