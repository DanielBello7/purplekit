import 'reflect-metadata';
import type {
  CREATE_DB,
  DB_STATUS,
  DROP_DB,
  GENERATE_MIGRATIONS,
  MIGRATE,
  MIGRATION,
  SEED,
} from './types';
import { program } from 'commander';
import {
  createdb,
  dropdb,
  gen,
  init,
  migrate,
  migration,
  seed,
  status,
} from './features';

// initialize the desc and info of the app
program
  .name('purplekit')
  .description('typeorm database actions wrapper')
  .version('1.0.0', '-v, --cli-version', 'Output the purplekit CLI version.');

// create core parts
program
  .command('init')
  .description('Setup required configurations, files and folders')
  .action(() => init());

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
  .option('--db <db>', 'The name of the db to be seeded')
  .action((args: SEED) => seed(args));

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
  .option('--db <database>', 'Database which migration should be applied to')
  .option(
    '--file <file>',
    'The path to the migration file to be executed eg. purplekit/migrations/Mig1234563534',
  )
  .action((args: MIGRATE) => migrate(args));

// run the whole migration process
program
  .command('migration')
  .description('Generate a new migration file and execute it immediately')
  .option(
    '-a, --all',
    'Run all migration files along with the newly generated migration',
  )
  .action((args: MIGRATION) => migration(args));

// start the app
program.parseAsync();
