"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const commander_1 = require("commander");
const features_1 = require("./features");
// initialize the desc and info of the app
commander_1.program
    .name('purplekit')
    .description('typeorm database actions wrapper')
    .version('1.0.0', '-v, --cli-version', 'Output the purplekit CLI version.');
// create core parts
commander_1.program
    .command('init')
    .description('Setup required configurations, files and folders')
    .action(() => (0, features_1.init)());
// generate a new migration
commander_1.program
    .command('gen')
    .description('Generate a new migrations file')
    .option('--name <name>', 'Title/Name of the migration')
    .option('-f, --force', 'Force the migration generation even if no changes exist')
    .action((args) => (0, features_1.gen)(args));
// create database
commander_1.program
    .command('createdb')
    .description('Create a new database')
    .option('--name <name>', 'Database name')
    .action((args) => (0, features_1.createdb)(args));
// drop database
commander_1.program
    .command('dropdb')
    .description('Drop an existing database')
    .option('--name <name>', 'Database name')
    .action((args) => (0, features_1.dropdb)(args));
// seed database
commander_1.program
    .command('seed')
    .description('Populate an existing database with seed data')
    .option('--db <db>', 'The name of the db to be seeded')
    .action((args) => (0, features_1.seed)(args));
// get the status of a database
commander_1.program
    .command('status')
    .description('Get the status of an existing database')
    .option('--name <name>', 'Database name')
    .action((args) => (0, features_1.status)(args));
// execute existing migrations
commander_1.program
    .command('migrate')
    .description('Execute already existing migration files')
    .option('--name <name>', 'Migration basename/class name without .ts')
    .option('--db <database>', 'Database which migration should be applied to')
    .option('--file <file>', 'The path to the migration file to be executed eg. purplekit/migrations/Mig1234563534')
    .action((args) => (0, features_1.migrate)(args));
// run the whole migration process
commander_1.program
    .command('migration')
    .description('Generate a new migration file and execute it immediately')
    .option('-a, --all', 'Run all migration files along with the newly generated migration')
    .action((args) => (0, features_1.migration)(args));
// start the app
commander_1.program.parseAsync();
//# sourceMappingURL=app.js.map