import { strict as assert } from 'node:assert';
import {
  getCheckMigrationCommand,
  getCreateDbCommand,
  getDbCheckCommand,
  getDbTablesCommand,
  getDropDbCommand,
} from '@/libs/get-commands';

describe('get-commands library', () => {
  describe('getDbTablesCommand', () => {
    it('returns a Postgres public base-table query', () => {
      assert.match(
        getDbTablesCommand('postgres'),
        /information_schema\.tables/,
      );
      assert.match(getDbTablesCommand('postgres'), /public/);
    });

    it('returns a MySQL or MariaDB schema table query', () => {
      assert.match(getDbTablesCommand('mysql'), /DATABASE\(\)/);
      assert.equal(getDbTablesCommand('mysql'), getDbTablesCommand('mariadb'));
    });

    it('returns a SQLite sqlite_master table query', () => {
      assert.match(getDbTablesCommand('sqlite'), /sqlite_master/);
      assert.equal(
        getDbTablesCommand('sqlite'),
        getDbTablesCommand('better-sqlite3'),
      );
    });

    it('returns an Oracle user_tables query', () => {
      assert.match(getDbTablesCommand('oracle'), /user_tables/);
    });

    it('returns an MSSQL information_schema table query', () => {
      assert.match(getDbTablesCommand('mssql'), /INFORMATION_SCHEMA\.TABLES/);
    });

    it('throws for unsupported database types', () => {
      assert.throws(() => getDbTablesCommand('mongodb' as any), /Unsupported/);
    });
  });

  describe('getDbCheckCommand', () => {
    it('returns a parameterized Postgres database check query', () => {
      assert.equal(
        getDbCheckCommand('postgres'),
        'SELECT 1 FROM pg_database WHERE DATNAME = $1',
      );
    });

    it('returns a parameterized MySQL or MariaDB database check query', () => {
      assert.match(getDbCheckCommand('mysql'), /\?/);
      assert.equal(getDbCheckCommand('mysql'), getDbCheckCommand('mariadb'));
    });

    it('returns an MSSQL database check query using @0', () => {
      assert.match(getDbCheckCommand('mssql'), /@0/);
    });

    it('returns an Oracle user check query', () => {
      assert.match(getDbCheckCommand('oracle'), /all_users/);
    });

    it('throws for SQLite database existence checks', () => {
      assert.throws(() => getDbCheckCommand('sqlite'), /filesystem/);
    });

    it('throws for unsupported database types', () => {
      assert.throws(() => getDbCheckCommand('mongodb' as any), /Unsupported/);
    });
  });

  describe('getDropDbCommand', () => {
    it('returns a quoted Postgres drop database command', () => {
      assert.equal(
        getDropDbCommand('app_db', 'postgres'),
        'DROP DATABASE IF EXISTS "app_db"',
      );
    });

    it('returns a backticked MySQL or MariaDB drop database command', () => {
      assert.equal(
        getDropDbCommand('app_db', 'mysql'),
        'DROP DATABASE IF EXISTS `app_db`',
      );
      assert.equal(
        getDropDbCommand('app_db', 'mysql'),
        getDropDbCommand('app_db', 'mariadb'),
      );
    });

    it('returns a bracketed MSSQL drop database command', () => {
      assert.equal(
        getDropDbCommand('app_db', 'mssql'),
        'DROP DATABASE [app_db]',
      );
    });

    it('returns an Oracle drop user cascade command', () => {
      assert.equal(
        getDropDbCommand('APP_DB', 'oracle'),
        'DROP USER "APP_DB" CASCADE',
      );
    });

    it('throws for SQLite database drops', () => {
      assert.throws(
        () => getDropDbCommand('app_db', 'sqlite'),
        /deleting the file/,
      );
    });

    it('throws for unsupported database types', () => {
      assert.throws(
        () => getDropDbCommand('app_db', 'mongodb' as any),
        /Unsupported/,
      );
    });
  });

  describe('getCreateDbCommand', () => {
    it('returns a quoted Postgres create database command', () => {
      assert.equal(
        getCreateDbCommand('app_db', 'postgres'),
        'CREATE DATABASE "app_db"',
      );
    });

    it('returns a backticked MySQL or MariaDB create database command', () => {
      assert.equal(
        getCreateDbCommand('app_db', 'mysql'),
        'CREATE DATABASE `app_db`',
      );
      assert.equal(
        getCreateDbCommand('app_db', 'mysql'),
        getCreateDbCommand('app_db', 'mariadb'),
      );
    });

    it('returns a bracketed MSSQL create database command', () => {
      assert.equal(
        getCreateDbCommand('app_db', 'mssql'),
        'CREATE DATABASE [app_db]',
      );
    });

    it('throws for SQLite database creation', () => {
      assert.throws(
        () => getCreateDbCommand('app_db', 'sqlite'),
        /opening\/creating/,
      );
    });

    it('throws for unsupported database types', () => {
      assert.throws(
        () => getCreateDbCommand('app_db', 'mongodb' as any),
        /Unsupported/,
      );
    });
  });

  describe('getCheckMigrationCommand', () => {
    it('returns a Postgres migration lookup query', () => {
      assert.match(getCheckMigrationCommand('postgres'), /\$1/);
    });

    it('returns a MySQL migration lookup query', () => {
      assert.match(getCheckMigrationCommand('mysql'), /\?/);
    });

    it('returns an MSSQL migration lookup query', () => {
      assert.match(getCheckMigrationCommand('mssql'), /@0/);
    });

    it('throws for unsupported migration lookup database types', () => {
      assert.throws(() => getCheckMigrationCommand('sqlite'), /Unsupported/);
    });
  });
});
