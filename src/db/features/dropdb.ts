import { print, printf } from '@/libs/print';
import { DROP_DB } from '@/types';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import { getDropDbCommand } from '@/libs/get-commands';
import { createDataSource } from '@/libs/create-ds';

/**
 * Drops a database if it exists.
 *
 * @param name - Database name to drop (expected to be sanitized).
 * @returns Whether the drop succeeded; includes `error` on failure.
 */
async function drop(name: string): Promise<{ dropped: boolean }> {
  const ds = createDataSource();
  let initialized = false;
  try {
    const command = getDropDbCommand(name);
    await ds.initialize();
    initialized = true;

    await ds.query(command);
    return { dropped: true };
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unable to serialize err';
    throw new Error(err);
  } finally {
    if (initialized) {
      await ds.destroy();
    }
  }
}

/**
 * CLI handler for the `dropdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
async function dropdb(args: DROP_DB) {
  const name = sanitize(args.name ?? cfg.DATABASE_NAME);
  try {
    const response = await drop(name);
    const msg = response.dropped
      ? `Database '${name}' dropped successfully`
      : `Couldn't drop Database '${name}'`;
    print(msg);
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unable to serialize err';
    printf(`Error dropping '${name}': ${err}`);
    process.exit(1);
  }
}

export { dropdb, drop };
