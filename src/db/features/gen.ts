import { generateMigration } from 'typeorm-extension';
import { createDataSource } from '@/libs/create-ds';
import { GENERATE_MIGRATIONS } from '@/types';
import { print, printf } from '@/libs/print';
import { DataSource } from 'typeorm';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import prettier from 'prettier';
import * as fs from 'fs';

/**
 * Detects pending schema changes by diffing entities against the database.
 *
 * @param ds - Initialized TypeORM data source.
 * @returns Whether up or down migration queries would be generated.
 */
const hasSchemaChanges = async (ds: DataSource) => {
  const builder = ds.driver.createSchemaBuilder();
  const sqlInMemory = await builder.log();
  const val =
    sqlInMemory.upQueries.length > 0 || sqlInMemory.downQueries.length > 0;
  return val;
};

/**
 * Generates a migration file from current entity schemas.
 *
 * @param database - Database the migration is generated against.
 * @param force - Force generation even when no schema changes are detected.
 * @param name - Migration file name; defaults to a timestamp.
 * @returns Generation outcome including title and whether changes were found.
 */
const generate = async (
  database: string,
  force?: boolean,
  name?: string,
): Promise<{
  hasChanges: boolean;
  generated: boolean;
  title: string;
  timestamp: number;
}> => {
  let initialized = false;
  const timestamp = Date.now();
  const ds = createDataSource({
    database,
  });

  const migrationName = name ?? `Mig`;
  let filename = `${migrationName}${timestamp}.ts`;

  try {
    await ds.initialize();
    initialized = true;

    const hasChanges = await hasSchemaChanges(ds);

    if (!hasChanges && !force) {
      return {
        generated: false,
        title: filename,
        hasChanges,
        timestamp,
      };
    }

    const result = await generateMigration({
      name: migrationName,
      timestamp,
      dataSource: ds,
      preview: true,
    });

    const formatted = await prettier.format(result.content!, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
    });

    await fs.promises.writeFile(`src/db/migrations/${filename}`, formatted);

    return {
      generated: true,
      title: filename,
      timestamp,
      hasChanges,
    };
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unable to serialize error';
    throw new Error(err);
  } finally {
    if (initialized) {
      await ds.destroy();
    }
  }
};

/**
 * CLI handler for the `gen` command.
 *
 * @param args - CLI options for migration name and force flag.
 */
const gen = async (args: GENERATE_MIGRATIONS) => {
  const database = sanitize(cfg.DATABASE_NAME);
  const name = args.name ? sanitize(args.name) : undefined;

  try {
    print(`Generating migration for ${database}...`);
    const response = await generate(database, args.force, name);
    if (!response.hasChanges && !args.force) {
      print('No schema changes detected — skipping migration generation');
      return;
    }

    print(`Migration for ${database} created successfully: ${response.title}`);
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Cannot serialize error';
    printf(`Error creating database: ${err}`);
    process.exit(1);
  }
};

export { gen, generate };
