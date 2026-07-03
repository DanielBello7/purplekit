import { getCheckMigrationCommand } from '@/libs/get-commands';
import { createDataSource } from '@/libs/create-ds';
import { print, printf } from '@/libs/print';
import { MIGRATE } from '@/types';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { sanitize } from '@/libs/sanitize';
import { cfg } from '@/config';

type MigrationResult = {
  migrated: boolean;
  status: 'migrated' | 'already-migrated' | 'no-migrations';
};

export type MigrationItem = {
  name: string;
  parentPath: string;
  exists: boolean;
  file: string;
};

/**
 * Lists migration directories under `src/db/migrations` and whether each
 * contains a `migration.ts` file.
 *
 * @returns An array of {@link MigrationItem} entries, one per migration folder.
 */
async function getMigrationFiles(): Promise<MigrationItem[]> {
  const root = `src/db/migrations`;
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const dirs = entries.filter((d) => d.isDirectory());
  return dirs
    .map((i) => {
      const loc = path.join(i.parentPath, i.name, 'migration.ts');
      return {
        name: i.name,
        file: loc,
        parentPath: i.parentPath,
        exists: fs.existsSync(loc),
      };
    })
    .filter((a) => a.exists);
}

/**
 * Checks whether a migration has already been recorded in the database.
 * Queries the `migrations` table via a dialect-specific command.
 *
 * @param ds - Initialized TypeORM data source.
 * @param name - Migration folder name to look up.
 * @returns Whether the migration name exists in the migrations table.
 */
async function hasMigration(ds: DataSource, name: string) {
  try {
    const command = getCheckMigrationCommand();
    const rows = await ds.query(command, [name]);
    const v = rows.length > 0;
    return v;
  } catch (e) {
    const code = typeof e === 'object' && e && 'code' in e ? e.code : undefined;
    const msg = e instanceof Error ? e.message : '';

    if (
      code === '42P01' ||
      msg.includes('relation "migrations" does not exist')
    ) {
      return false;
    }

    throw e;
  }
}

/**
 * Resolves which local migrations still need to run against the database.
 * Opens the default data source, discovers migration folders (optionally
 * scoped to `name`), and filters out entries that are missing or already recorded.
 *
 * @param name - Optional migration folder name; when omitted, all folders are considered.
 * @returns Pending {@link MigrationItem} entries; empty when none apply.
 * @throws When the data source cannot connect or migration lookup fails.
 */
async function getMigrationsToRun(
  name?: string,
  db?: string,
): Promise<MigrationItem[]> {
  const ds = createDataSource(db ? { database: db } : {});
  let initialized = false;
  try {
    await ds.initialize();
    initialized = true;

    const items = new Set<MigrationItem>();
    if (name) {
      const path = `src/db/migrations/${name}/migration.ts`;
      if (fs.existsSync(path)) {
        items.add({
          exists: true,
          file: path,
          name,
          parentPath: `src/db/migrations/${name}`,
        });
      }
    } else {
      const files = await getMigrationFiles();
      files.forEach((f) => items.add(f));
    }

    const a = await Promise.all(
      Array.from(items).map(async (f) => {
        return {
          ...f,
          isMigrated: await hasMigration(ds, f.name),
        };
      }),
    );
    return a
      .filter((f) => f.exists && !f.isMigrated)
      .map(({ isMigrated, ...f }) => f);
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
 * Runs pending migrations discovered via {@link getMigrationsToRun}.
 * When `name` is omitted, runs every unmigrated folder under `src/db/migrations`.
 *
 * @param name - Optional migration folder name to run a single migration.
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When migration discovery or execution fails.
 */
async function runMigrationByName(
  name?: string,
  db?: string,
): Promise<MigrationResult> {
  let initialized = false;
  let ds: DataSource | null = null;

  try {
    const migratable = await getMigrationsToRun(name, db);
    if (migratable.length < 1) {
      return {
        migrated: false,
        status: 'no-migrations',
      };
    }

    ds = createDataSource({
      migrations: migratable.map((m) => m.file),
      ...(db ? { database: db } : {}),
    });
    await ds.initialize();
    initialized = true;

    const executed = await ds.runMigrations();
    if (executed.length < 1) {
      return {
        migrated: false,
        status: 'no-migrations',
      };
    }

    return {
      migrated: true,
      status: 'migrated',
    };
  } catch (e) {
    const parsed = e instanceof Error ? e.message : JSON.stringify(e);
    throw new Error(parsed);
  } finally {
    if (initialized && ds) {
      await ds.destroy();
    }
  }
}

/**
 * Runs all migrations registered on a TypeORM data source configuration.
 * Initializes the data source, executes pending migrations in a single
 * transaction, then destroys the connection.
 *
 * @param ds - TypeORM data source with `migrations` configured (not yet initialized).
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When initialization or migration execution fails.
 */
async function runMigrationByConfig(db?: string): Promise<MigrationResult> {
  const ds = createDataSource(db ? { database: db } : {});
  let initialized = false;
  try {
    await ds.initialize();
    initialized = true;

    const response = await ds.runMigrations({
      fake: false,
      transaction: 'all',
    });
    if (response.length < 1) {
      return {
        migrated: false,
        status: 'no-migrations',
      };
    }
    return {
      migrated: true,
      status: 'migrated',
    };
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
 * Resolves a migration folder name and `migration.ts` path from a CLI path input.
 * Accepts either a migration directory or a direct path to `migration.ts`.
 * Validates that the folder name is class-style and ends with a 13-digit timestamp.
 *
 * @param input - Migration folder or file path from `--file`.
 * @returns The migration name and normalized path to `migration.ts`.
 * @throws When the name is invalid or the migration file does not exist.
 */
function getMigrationNameFromPath(input: string): {
  name: string;
  path: string;
} {
  const normalized = path.normalize(input);
  const base = path.basename(normalized);

  const file =
    base === 'migration.ts'
      ? normalized
      : path.join(normalized, 'migration.ts');
  const migdir = path.dirname(file);

  const name = path.basename(migdir);
  const validMigName = new RegExp(/^[A-Za-z][A-Za-z0-9_]*\d{13}$/);

  if (!validMigName.test(name)) {
    throw new Error(
      `Invalid migration name. Expected a class-style name ending with a 13-digit timestamp`,
    );
  }

  if (!fs.existsSync(file)) {
    throw new Error(`Migration file doesn't exist: ${file}`);
  }

  return {
    name,
    path: file,
  };
}

/**
 * CLI handler for the `migrate` command.
 * Runs pending migrations via {@link runMigrationByName}. When `--file` is
 * provided, resolves the migration name from the path first.
 * Prints the outcome to stdout and exits with code 0 or 1.
 *
 * @param args - CLI options; `--name` scopes to one migration folder, `--file` to a folder or `migration.ts` path.
 */
async function migrate(args: MIGRATE) {
  const database = sanitize(args.db ?? cfg.DATABASE_NAME);
  try {
    let response: MigrationResult;
    if (args.file) {
      const result = getMigrationNameFromPath(args.file);
      response = await runMigrationByName(result.name, database);
    } else {
      response = await runMigrationByName(args.name, database);
    }

    if (response.migrated) {
      print('Migrations run successfully');
      process.exit(0);
    }

    print(`Migrations didn't run: ${response.status}`);
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to serialize error';
    printf(msg);
    process.exit(1);
  }
}

export {
  migrate,
  runMigrationByConfig,
  runMigrationByName,
  getMigrationsToRun,
  hasMigration,
  getMigrationFiles,
};
