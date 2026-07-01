import { getCheckMigrationCommand } from '@/libs/get-commands';
import { createDataSource } from '@/libs/create-ds';
import { printf } from '@/libs/print';
import { MIGRATE } from '@/types';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

type MigrationResult = {
  migrated: boolean;
  status: 'migrated' | 'already-migrated' | 'no-migrations';
};

async function getMigrationFiles() {
  const p = `src/db/migrations`;
  return fs.readdirSync(p).map((i) => {
    return {
      name: i.split('.ts')[0]!,
      path: path.join(p, i),
      file: i,
    };
  });
}

async function hasMigration(ds: DataSource, name: string) {
  const command = getCheckMigrationCommand();
  const rows = await ds.query(command, [name]);
  const v = rows.length > 0;
  return v;
}

async function runMigrationByName(name: string): Promise<MigrationResult> {
  const path = `src/db/migrations/${name}.ts`;
  let initialized = false;
  const ds = createDataSource({
    migrations: [path],
  });

  try {
    const fileExists = fs.existsSync(path);
    if (!fileExists) throw new Error("migration file doesn't exist");

    await ds.initialize();
    initialized = true;

    const migrated = await hasMigration(ds, name);
    if (migrated) {
      return {
        migrated: false,
        status: 'already-migrated',
      };
    }

    const executed = await ds.runMigrations({
      transaction: 'all',
      fake: false,
    });

    console.log('executed', executed);
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
    if (initialized) {
      await ds.destroy();
    }
  }
}

async function runMigrationByConfig(ds: DataSource): Promise<MigrationResult> {
  let initialized = false;
  try {
    await ds.initialize();
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

async function runManyMigrationsByName() {}

/**
 * performs migrations with already existing migration files on a database that
 * has been initialized
 * @param args
 */
async function migrate(args: MIGRATE) {
  let initialized = false;
  const ds2 = createDataSource();
  try {
    await ds2.initialize();
    initialized = true;

    const a = await getMigrationFiles();
    const result = await Promise.all(
      a.map(async (item) => {
        const res = await hasMigration(ds2, item.name);
        return res;
      }),
    );

    console.log(result);

    // const a = await ds2.showMigrations();
    // const a = await ds2.runMigrations();

    // console.log('a', a);
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unable to serialize error';
    printf(msg);
    process.exit(1);
  } finally {
    if (initialized) {
      await ds2.destroy();
    }
  }
}

export { migrate, hasMigration, runMigrationByName, runMigrationByConfig };
