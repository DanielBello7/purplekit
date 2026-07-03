import { getDbCheckCommand, getDbTablesCommand } from '@/libs/get-commands';
import { createDataSource } from '@/libs/create-ds';
import { DB_STATUS } from '@/types';
import { print, printf } from '@/libs/print';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import { getMigrationFiles, hasMigration, MigrationItem } from './migrate';
import {
  compareMig,
  getParserDialect,
  MigrationDuplicate,
} from '@/libs/compare-mig';
import * as fs from 'fs/promises';

const migrationStatus = async (name?: string) => {
  let initialized = false;
  const ds2 = createDataSource(name ? { database: name } : {});

  try {
    await ds2.initialize();
    initialized = true;

    const migrations = await getMigrationFiles();

    const applied: MigrationItem[] = [];
    const pending: MigrationItem[] = [];

    const response = await Promise.all(
      migrations.map(async (m) => {
        const hasRun = await hasMigration(ds2, m.name);
        return { ...m, hasRun };
      }),
    );

    for (const m of response) {
      const { hasRun, ...rest } = m;
      if (hasRun) applied.push(rest);
      else pending.push(rest);
    }

    return { applied, pending };
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    throw new Error(msg);
  } finally {
    if (initialized) {
      await ds2.destroy();
    }
  }
};

const checkForDuplicateMig = async (): Promise<{
  total: number;
  checks: (MigrationItem & { duplicateOf: MigrationDuplicate })[];
}> => {
  const results: (MigrationItem & { duplicateOf: MigrationDuplicate })[] = [];
  const dialect = getParserDialect(cfg.TYPE);
  const files = await getMigrationFiles();

  for (const i of files) {
    const existing = files.filter((m) => i.name !== m.name);
    const data = await fs.readFile(i.file, { encoding: 'utf-8' });
    const resp = await compareMig(data, existing, dialect);
    if (resp)
      results.push({
        duplicateOf: resp,
        ...i,
      });
    else continue;
  }
  return {
    total: files.length,
    checks: results,
  };
};

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
  // this datasource connects to the postgres because that always exists so it actually doesn't need
  // a db pass onto its object
  const ds = createDataSource();
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
 * @param db - Database to inspect.
 * @returns Table count on success; `tables: 0` and `err` on failure.
 */
const dbStatus = async (
  db: string,
): Promise<{ tables: number } & Record<string, any>> => {
  // target data source
  let initialized = false;
  const tds = createDataSource({ database: db });
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
    let response: Record<string, any> = {};
    const exists = await doesDbExists(name);

    if (exists.databaseOk) {
      const check = await dbStatus(name);
      const migsCheck = await migrationStatus(name);
      response = {
        ...response,
        ...exists,
        ...check,
        migrations: {
          applied: migsCheck.applied.length,
          pending: migsCheck.pending.length,
        },
      };
    }
    const migs = await checkForDuplicateMig();

    response = {
      ...response,
      ...exists,
      migrations: {
        ...response.migrations,
        files: migs.total,
        duplicates: migs.checks.map((m) => ({
          name: m.name,
          duplicateOf: m.duplicateOf.name,
        })),
      },
    };

    print(JSON.stringify(response, null, 2));
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to Serialize';
    printf(`Error occurred: ${msg}`);
    process.exit(1);
  }
};

export { status, dbStatus, doesDbExists };
