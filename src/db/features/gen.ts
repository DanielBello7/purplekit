import { generateMigration } from 'typeorm-extension';
import { createDataSource } from '@/libs/create-ds';
import { GENERATE_MIGRATIONS } from '@/types';
import { print, printf } from '@/libs/print';
import { DataSource } from 'typeorm';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import { compareMig, getParserDialect } from '@/libs/compare-mig';
import { getMigrationFiles } from './migrate';
import prettier from 'prettier';
import * as fs from 'fs';
import * as path from 'path';

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

const genMig = async (ds: DataSource, name: string, timestamp: number) => {
  const hasChanges = await hasSchemaChanges(ds);

  const result = await generateMigration({
    name,
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

  return {
    content: result.content!,
    formatted,
    hasChanges,
  };
};

const saveMig = async (location: string, content: string) => {
  await fs.promises.mkdir(path.dirname(location), { recursive: true });
  await fs.promises.writeFile(location, content);
  return void 0;
};

const getMetadata = (name?: string) => {
  const timestamp = Date.now();
  const migrationName = name ?? `Mig`;
  const filename = `${migrationName}${timestamp}`;
  const location = `src/db/migrations/${filename}/migration.ts`;

  return {
    location,
    filename,
    migrationName,
    timestamp,
  };
};

type MoreInfo = {
  title: string;
  timestamp: number;
};

type Success = {
  generated: true;
  more: MoreInfo;
};

type Failure = {
  generated: false;
  more: {
    reason: 'duplicate-found' | 'no-changes';
    duplicateOf?: string;
  } & MoreInfo;
};
type GeneratReturn = Success | Failure;
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
): Promise<GeneratReturn> => {
  let initialized = false;
  const ds = createDataSource({ database });
  const { filename, location, migrationName, timestamp } = getMetadata(name);

  try {
    const dialect = getParserDialect(cfg.TYPE);
    const existing = await getMigrationFiles();

    await ds.initialize();
    initialized = true;

    const generated = await genMig(ds, migrationName, timestamp);
    if (!generated.hasChanges && !force) {
      return {
        generated: false,
        more: { reason: 'no-changes', timestamp, title: filename },
      };
    }

    const duplicate = await compareMig(generated.content, existing, dialect);

    if (duplicate) {
      return {
        generated: false,
        more: {
          reason: 'duplicate-found',
          timestamp,
          title: filename,
          duplicateOf: duplicate.name,
        },
      };
    }

    await saveMig(location, generated.formatted);
    return {
      generated: true,
      more: {
        timestamp,
        title: filename,
      },
    };
  } catch (e) {
    const err = e instanceof Error ? e.message : JSON.stringify(e);
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
    if (!response.generated) {
      if (response.more.reason === 'no-changes') {
        print('No schema changes detected — skipping migration generation');
      }
      if (response.more.reason === 'duplicate-found') {
        printf(`Duplicate migration found: ${response.more.duplicateOf}`);
      } else throw new Error('Unknown generated response');
    } else {
      print(
        `Migration for ${database} created successfully: ${response.more.title}`,
      );
    }
    process.exit(0);
  } catch (e) {
    const err = e instanceof Error ? e.message : JSON.stringify(e);
    printf(`Error creating database: ${err}`);
    process.exit(1);
  }
};

export { gen, generate };
