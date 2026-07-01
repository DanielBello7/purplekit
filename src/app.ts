import 'reflect-metadata';
import type {
  CREATE_DB,
  DB_STATUS,
  DROP_DB,
  GENERATE_MIGRATIONS,
  MIGRATE,
} from './types';
import { migration } from './db/features/migration';
import { dropdb } from './db/features/dropdb';
import { program } from 'commander';
import { createdb } from './db/features/createdb';
import { seed } from './db/features/seed';
import { migrate } from './db/features/migrate';
import { gen } from './db/features/gen';
import { status } from './db/features/status';

// initialize the desc and info of the app
program
  .name('tgx')
  .description('typeorm database actions wrapper')
  .version('1.0.0', '-v, --cli-version', 'Output the tgx CLI version.');

// generate a new migration
program
  .command('gen')
  .description('Generate a new migrations file')
  .option('--name <name>', 'Title/Name of the migration')
  .option(
    '-f, --force',
    'Force the migration generation even if no changes exist',
  )
  .action((args: GENERATE_MIGRATIONS) => gen(args));

// create database
program
  .command('createdb')
  .description('Create a new database')
  .option('--name <name>', 'Database name')
  .action((args: CREATE_DB) => createdb(args));

// drop database
program
  .command('dropdb')
  .description('Drop an existing database')
  .option('--name <name>', 'Database name')
  .action((args: DROP_DB) => dropdb(args));

// seed database
program
  .command('seed')
  .description('Populate an existing database with seed data')
  .action((args) => seed(args));

// get the status of a database
program
  .command('status')
  .description('Get the status of an existing database')
  .option('--name <name>', 'Database name')
  .action((args: DB_STATUS) => status(args));

// execute existing migrations
program
  .command('migrate')
  .description('Execute already existing migration files')
  .option('--name <name>', 'Migration basename/class name without .ts')
  .option('--file <file>', 'The path to the migration file to be executed')
  .action((args: MIGRATE) => migrate(args));

// run the whole migration process
program
  .command('migration')
  .description('Generate a new migration file and execute it immediately')
  .action((args) => migration(args));

// start the app
program.parseAsync();
