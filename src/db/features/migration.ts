import { generate, saveMig } from './gen';
import { cfg } from '@/config';
import { runMigrationByConfig, runMigrationByName } from './migrate';
import { MIGRATION } from '@/types';
import { sanitize } from '@/libs/sanitize';
import { print, printf } from '@/libs/print';
import * as fs from 'fs/promises';
import * as path from 'path';

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
          ? `Duplicate migration found: ${response.more.duplicateOf}`
          : 'No changes have been made to the schema files',
    };
  }

  await saveMig(response.more.location, response.more.content);

  try {
    const ans = all
      ? await runMigrationByConfig(database)
      : await runMigrationByName(response.more.title, database);

    if (!ans.migrated) {
      await removeMig(response.more.location);
      return { generated: true, applied: false, msg: 'Nothing to migrate' };
    }

    return { generated: true, applied: true, msg: 'migrated' };
  } catch (e) {
    await removeMig(response.more.location);
    throw e;
  }
}

/**
 * creates a migration file based on the schemas
 * @param args
 */
async function migration(args: MIGRATION) {
  try {
    const response = await apply(args.all);
    if (!response.applied) printf(response.msg);
    else print(response.msg);
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    printf(msg);
    process.exit(1);
  }
}

export { migration };
