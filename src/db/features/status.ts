import { getDbCheckCommand, getDbTablesCommand } from '@/libs/get-commands';
import { createDataSource } from '@/libs/create-ds';
import { DB_STATUS } from '@/types';
import { print, printf } from '@/libs/print';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import ds from '@/db/ds';

/**
 * Checks whether a database with the given name exists.
 * Connects via the default data source and runs a dialect-specific query.
 *
 * @param name - Database name to check (expected to be sanitized).
 * @returns Whether the database exists; includes `error` when the check fails.
 */
const doesDbExists = async (
  name: string,
): Promise<{ databaseOk: boolean; dbName: string } & Record<string, any>> => {
  let initialized = false;
  try {
    const command = getDbCheckCommand();
    await ds.initialize();
    initialized = true;

    const query = await ds.query(command, [name]);
    const exists = query.length > 0;

    return {
      databaseOk: exists,
      dbName: name,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unable to serialize error';
    throw new Error(msg);
  } finally {
    if (initialized) {
      await ds.destroy();
    }
  }
};

/**
 * Inspects a target database and returns its public/base table count.
 * Opens a dedicated TypeORM data source pointed at `name`.
 *
 * @param name - Database to inspect.
 * @returns Table count on success; `tables: 0` and `err` on failure.
 */
const dbStatus = async (
  name: string,
): Promise<{ tables: number } & Record<string, any>> => {
  // target data source
  let initialized = false;
  const tds = createDataSource({ database: name });
  try {
    const command = getDbTablesCommand();
    await tds.initialize();
    initialized = true;

    const response = await tds.query(command);
    return {
      tables: response.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to serialize';
    throw new Error(msg);
  } finally {
    if (initialized) {
      await tds.destroy();
    }
  }
};

/**
 * CLI handler for the `status` command.
 * Checks database existence and, if it exists, reports the table count.
 * Prints a JSON object to stdout.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
const status = async (args: DB_STATUS) => {
  const name = sanitize(args.name ?? cfg.DATABASE_NAME);

  try {
    let response = {};
    const exists = await doesDbExists(name);

    if (exists.databaseOk) {
      const check = await dbStatus(name);
      response = { ...response, ...exists, ...check };
    } else
      response = {
        ...response,
        ...exists,
      };
    print(JSON.stringify(response, null, 2));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to Serialize';
    printf(`Error occured: ${msg}`);
    process.exit(1);
  }
};

export { status, dbStatus, doesDbExists };
