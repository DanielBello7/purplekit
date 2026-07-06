import { generate, saveMig } from './gen';
import { cfg } from '@/config';
import { runMigrationByConfig, runMigrationByName } from './migrate';
import { MIGRATION } from '@/types';
import { sanitize } from '@/libs/sanitize';
import { print, printf } from '@/libs/print';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Removes a generated migration folder from a `migration.ts` file location.
 *
 * @param location - Generated migration file path.
 */
async function removeMig(location: string) {
  await fs.rm(path.dirname(location), {
    force: true,
    recursive: true,
  });
}

type ApplyReturn = {
  applied: boolean;
  generated: boolean;
  msg: string;
};

/**
 * Generates a migration and immediately applies it to the configured database.
 * The generated file is removed when execution fails or no migration runs.
 *
 * @param all - Whether to run all configured migrations instead of only the new one.
 * @returns Result describing whether generation and application succeeded.
 */
async function apply(all?: boolean): Promise<ApplyReturn> {
  // generate migration files
  const database = sanitize(cfg.DATABASE_NAME);
  const response = await generate({ db: database, save: false });
  if (!response.generated) {
    return {
      applied: false,
      generated: false,
      msg:
        response.more.reason === 'duplicate-found'
          ? `Duplicate migration found: ${response.more.duplicateOf}.`
          : 'No schema changes detected. Migration generation skipped.',
    };
  }

  await saveMig(response.more.location, response.more.content);

  try {
    const ans = all
      ? await runMigrationByConfig(database)
      : await runMigrationByName(response.more.title, database);

    if (!ans.migrated) {
      await removeMig(response.more.location);
      return {
        generated: true,
        applied: false,
        msg: 'No migrations were run.',
      };
    }

    return {
      generated: true,
      applied: true,
      msg: 'Migration completed successfully.',
    };
  } catch (e) {
    await removeMig(response.more.location);
    throw e;
  }
}

/**
 * CLI handler for the `migration` command.
 *
 * @param args - Command options, including whether to run all migrations.
 */
async function migration(args: MIGRATION) {
  try {
    const response = await apply(args.all);
    if (!response.applied) printf(response.msg);
    else print(response.msg);
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    printf(`Failed to apply migration: ${msg}`);
    process.exit(1);
  }
}

export { migration, apply, removeMig };
