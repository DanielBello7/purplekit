import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
/**
 * Inserts seed records for an entity while skipping records that already exist.
 * Existing records are detected by the `id` field.
 *
 * @param ds - Initialized TypeORM data source.
 * @param entity - Entity class or schema to seed.
 * @param records - Seed records containing stable `id` values.
 * @param label - Human-readable label used in the seed summary.
 */
declare function seedEntities<T extends ObjectLiteral>(ds: DataSource, entity: EntityTarget<T>, records: Record<string, unknown>[], label: string): Promise<void>;
export { seedEntities };
//# sourceMappingURL=seed-entities.d.ts.map