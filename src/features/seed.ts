import { cfg } from '@/config';
import { createDataSource } from '@/libs/create-ds';
import { print, printf } from '@/libs/print';
import { sanitize } from '@/libs/sanitize';
import { SEED } from '@/types';
import { runSeeder, Seeder } from 'typeorm-extension';

/**
 * Runs seed classes against a target database.
 *
 * @param seeds - Seeder classes to execute in order.
 * @param db - Optional database override; defaults to configured database.
 * @returns Whether all seeders completed successfully.
 */
async function seeder(seeds: (new () => Seeder)[], db?: string) {
  const database = sanitize(db ?? cfg.DATABASE_NAME);
  const ds = createDataSource({ database });
  let initialized = false;

  try {
    await ds.initialize();
    initialized = true;

    for (const seed of seeds) {
      await runSeeder(ds, seed);
    }
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    throw new Error(msg);
  } finally {
    if (initialized) {
      await ds.destroy();
    }
  }
}

/**
 * CLI handler for the `seed` command.
 * Populates an existing, migrated database with configured seed classes.
 *
 * @param args - Command options including an optional database override.
 */
export async function seed(args: SEED) {
  try {
    const seeds: (new () => Seeder)[] = cfg.SEEDS;
    const response = await seeder(seeds, args.db);
    if (!response) throw new Error('unable to complete seeding');
    print('Seeding complete');
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    printf(msg);
    process.exit(1);
  }
}
