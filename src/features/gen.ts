import { generateMigration } from 'typeorm-extension';
import { createDataSource } from '@/libs/create-ds';
import { GENERATE_MIGRATIONS } from '@/types';
import { print, printf } from '@/libs/print';
import { DataSource } from 'typeorm';
import { cfg } from '@/config';
import { sanitize } from '@/libs/sanitize';
import { compareMig, getParserDialect } from '@/libs/compare-mig';
import { getMigrationFiles } from './migrate';
import { getMigrationLocation } from '@/libs/paths';
import prettier from 'prettier';
import * as fs from 'fs';
import * as path from 'path';

type MoreInfo = {
  title: string;
  saved: boolean;
  timestamp: number;
  location: string;
};

type Success = {
  generated: true;
  more: MoreInfo & { content: string };
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
 * Generates a migration preview from an initialized data source and formats it.
 *
 * @param ds - Initialized TypeORM data source to diff against.
 * @param name - Migration class/name prefix.
 * @param timestamp - Timestamp suffix TypeORM uses in the migration class.
 * @returns Generated source, formatted source, and whether schema changes exist.
 */
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

/**
 * Persists a generated migration file, creating its parent folder first.
 *
 * @param location - Destination `migration.ts` path.
 * @param content - TypeScript migration source to write.
 */
const saveMig = async (location: string, content: string) => {
  await fs.promises.mkdir(path.dirname(location), { recursive: true });
  await fs.promises.writeFile(location, content);
  return void 0;
};

/**
 * Builds the generated migration name and location metadata.
 *
 * @param name - Optional migration name prefix; defaults to `Mig`.
 * @returns Timestamped filename, TypeORM migration name, and target file path.
 */
const getMetadata = (name?: string) => {
  const timestamp = Date.now();
  const migrationName = name ?? `Mig`;
  const filename = `${migrationName}${timestamp}`;
  const location = getMigrationLocation(filename);

  return {
    location,
    filename,
    migrationName,
    timestamp,
  };
};

type GenerateParams = {
  db: string;
  force: boolean | undefined;
  name: string | undefined;
  save: boolean | undefined;
};
/**
 * Generates a migration file from current entity schemas.
 *
 * @param params - Generation options including target database, force flag,
 * migration name prefix, and whether to save the file.
 * @returns Generation outcome including title and whether changes were found.
 */
const generate = async (
  params: Partial<GenerateParams> = {},
): Promise<GeneratReturn> => {
  let initialized = false;
  const ds = createDataSource(params.db ? { database: params.db } : {});
  const metadata = getMetadata(params.name);

  try {
    await ds.initialize();
    initialized = true;

    const generated = await genMig(
      ds,
      metadata.migrationName,
      metadata.timestamp,
    );
    if (!generated.hasChanges && !params.force) {
      return {
        generated: false,
        more: {
          reason: 'no-changes',
          timestamp: metadata.timestamp,
          title: metadata.filename,
          saved: false,
          location: metadata.location,
        },
      };
    }

    const dialect = getParserDialect(cfg.TYPE);
    const existing = await getMigrationFiles();
    const duplicate = await compareMig(generated.content, existing, dialect);

    if (duplicate) {
      return {
        generated: false,
        more: {
          location: metadata.location,
          reason: 'duplicate-found',
          timestamp: metadata.timestamp,
          saved: false,
          title: metadata.filename,
          duplicateOf: duplicate.name,
        },
      };
    }

    if (params.save) {
      await saveMig(metadata.location, generated.formatted);
    }
    return {
      generated: true,
      more: {
        location: metadata.location,
        saved: params.save ?? false,
        timestamp: metadata.timestamp,
        title: metadata.filename,
        content: generated.formatted,
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
    const response = await generate({
      force: args.force,
      db: database,
      name: name,
      save: true,
    });
    if (!response.generated) {
      if (response.more.reason === 'no-changes') {
        print('No schema changes detected — skipping migration generation');
      } else if (response.more.reason === 'duplicate-found') {
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
    printf(`Migration generation failed: ${err}`);
    process.exit(1);
  }
};

export {
  gen,
  generate,
  genMig,
  compareMig,
  getMetadata,
  saveMig,
  hasSchemaChanges,
};
