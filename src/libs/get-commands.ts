import { DataSourceOptions } from 'typeorm';
import { cfg } from '@/config';

type Params = DataSourceOptions['type'];

/**
 * Returns the SQL used to list user/base tables for the given DB type.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameter-free SQL query string.
 */
const getDbTablesCommand = (type: Params = cfg.TYPE) => {
  switch (type) {
    case 'postgres':
      return `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;

    case 'mysql':
    case 'mariadb':
      return `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`;

    case 'sqlite':
    case 'better-sqlite3':
      return `SELECT name FROM sqlite_master WHERE type = 'table'`;

    case 'oracle':
      return `SELECT table_name FROM user_tables`;

    case 'mssql':
      return `SELECT TABLE_NAME AS table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;

    default:
      throw new Error('Unsupported database type');
  }
};

/**
 * Returns the parameterized SQL used to check whether a database exists.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameterized SQL query string.
 * @throws When the type is unsupported (e.g. SQLite uses filesystem checks).
 */
const getDbCheckCommand = (type: Params = cfg.TYPE) => {
  switch (type) {
    case 'postgres':
      return 'SELECT 1 FROM pg_database WHERE DATNAME = $1';

    case 'mysql':
    case 'mariadb':
      return 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?';

    case 'mssql':
      return `SELECT name FROM sys.databases WHERE name = @0`;

    case 'oracle':
      return `SELECT username FROM all_users WHERE username = :1`;

    case 'sqlite':
    case 'better-sqlite3':
      throw new Error(
        'SQLite database existence should be checked via filesystem',
      );

    default:
      throw new Error('Unsupported database type');
  }
};

/**
 * Returns the SQL used to drop a database for the given DB type.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameterized or literal SQL query string.
 * @throws When the type is unsupported.
 */
const getDropDbCommand = (name: string, type: Params = cfg.TYPE) => {
  switch (type) {
    case 'mariadb':
    case 'mysql':
      return `DROP DATABASE IF EXISTS \`${name}\``;

    case 'postgres':
      return `DROP DATABASE IF EXISTS "${name}"`;

    case 'mssql':
      return `DROP DATABASE [${name}]`;

    case 'oracle':
      return `DROP USER "${name}" CASCADE`;

    case 'better-sqlite3':
    case 'sqlite':
      throw new Error(
        'SQLite databases should be dropped by deleting the file',
      );

    default:
      throw new Error('Unsupported database type');
  }
};

const getCreateDbCommand = (name: string, type: Params = cfg.TYPE) => {
  switch (type) {
    case 'postgres':
      return `CREATE DATABASE "${name}"`;

    case 'mysql':
    case 'mariadb':
      return `CREATE DATABASE \`${name}\``;

    case 'mssql':
      return `CREATE DATABASE [${name}]`;

    case 'sqlite':
    case 'better-sqlite3':
      throw new Error(
        'SQLite databases are created by opening/creating the file',
      );

    default:
      throw new Error('Unsupported database type');
  }
};

const getCheckMigrationCommand = (type: Params = cfg.TYPE) => {
  switch (type) {
    case 'postgres':
      return `SELECT 1 FROM migrations WHERE name = $1 LIMIT 1`;

    case 'mysql':
      return `SELECT 1 FROM migrations WHERE name = ? LIMIT 1`;

    case 'mssql':
      return `SELECT TOP 1 1 FROM migrations WHERE name = @0`;

    default:
      throw new Error('Unsupported database type');
  }
};

export {
  getDbTablesCommand,
  getDbCheckCommand,
  getDropDbCommand,
  getCreateDbCommand,
  getCheckMigrationCommand,
};
