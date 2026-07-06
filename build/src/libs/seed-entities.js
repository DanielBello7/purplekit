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
exports.seedEntities = seedEntities;
const print_1 = require("./print");
/**
 * Inserts seed records for an entity while skipping records that already exist.
 * Existing records are detected by the `id` field.
 *
 * @param ds - Initialized TypeORM data source.
 * @param entity - Entity class or schema to seed.
 * @param records - Seed records containing stable `id` values.
 * @param label - Human-readable label used in the seed summary.
 */
function seedEntities(ds, entity, records, label) {
    return __awaiter(this, void 0, void 0, function* () {
        const repo = ds.getRepository(entity);
        let skipped = 0;
        let added = 0;
        for (const record of records) {
            const existing = yield repo.findOne({ where: { id: record.id } });
            if (existing) {
                skipped++;
                continue;
            }
            yield repo.save(record);
            added++;
        }
        (0, print_1.print)(`Seeded ${label}: ${added} added, ${skipped} skipped, ${records.length} total.`);
    });
}
//# sourceMappingURL=seed-entities.js.map