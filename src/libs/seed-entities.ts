import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { print } from './print';

/**
 * Inserts seed records for an entity while skipping records that already exist.
 * Existing records are detected by the `id` field.
 *
 * @param ds - Initialized TypeORM data source.
 * @param entity - Entity class or schema to seed.
 * @param records - Seed records containing stable `id` values.
 * @param label - Human-readable label used in the seed summary.
 */
async function seedEntities<T extends ObjectLiteral>(
  ds: DataSource,
  entity: EntityTarget<T>,
  records: Record<string, unknown>[],
  label: string,
) {
  const repo = ds.getRepository(entity);
  let skipped = 0;
  let added = 0;

  for (const record of records) {
    const existing = await repo.findOne({ where: { id: record.id } as any });
    if (existing) {
      skipped++;
      continue;
    }

    await repo.save(record as any);
    added++;
  }

  print(
    `Total ${label}: ${records.length}. Seeded ${added} ${label} (skipped ${skipped} existing).`,
  );
}

export { seedEntities };
