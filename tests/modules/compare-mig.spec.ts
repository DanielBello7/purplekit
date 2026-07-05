import { compareMig, getParserDialect } from '@/libs/compare-mig';
import { MigrationItem } from '@/features/migrate';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { migration } from '../helpers/migration-gen';
import * as fs from 'fs/promises';
import * as os from 'node:os';
import * as path from 'path';

const item = (name: string, file: string): MigrationItem => ({
  name,
  file,
  parentPath: path.dirname(file),
  exists: true,
});

describe('compare-mig library', () => {
  describe('getParserDialect', () => {
    it('maps postgres to postgresql', () => {
      assert.equal(getParserDialect('postgres'), 'postgresql');
    });

    it('maps mysql and mariadb to mysql', () => {
      assert.equal(getParserDialect('mysql'), 'mysql');
      assert.equal(getParserDialect('mariadb'), 'mysql');
    });

    it('maps sqlite and better-sqlite3 to sqlite', () => {
      assert.equal(getParserDialect('sqlite'), 'sqlite');
      assert.equal(getParserDialect('better-sqlite3'), 'sqlite');
    });

    it('maps mssql to transactsql', () => {
      assert.equal(getParserDialect('mssql'), 'transactsql');
    });

    it('defaults unknown types to postgresql', () => {
      assert.equal(getParserDialect('unknown'), 'postgresql');
    });
  });

  describe('compareMig', () => {
    it('returns null when there are no existing migrations', async () => {
      const current = migration('Mig1000000000001', [
        'CREATE TABLE users (id int)',
      ]);

      const result = await compareMig(current, [], 'postgresql');

      assert.equal(result, null);
    });

    it('returns null when no existing migration has the same normalized up queries', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-compare-'));
      const existingFile = path.join(root, 'Mig1000000000001', 'migration.ts');
      await fs.mkdir(path.dirname(existingFile), { recursive: true });
      await fs.writeFile(
        existingFile,
        migration('Mig1000000000001', ['CREATE TABLE posts (id int)']),
      );

      const current = migration('Mig1000000000002', [
        'CREATE TABLE users (id int)',
      ]);

      const result = await compareMig(
        current,
        [item('Mig1000000000001', existingFile)],
        'postgresql',
      );

      assert.equal(result, null);
      await fs.rm(root, { recursive: true, force: true });
    });

    it('returns duplicate metadata when an existing migration has the same normalized up queries', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-compare-'));
      const existingFile = path.join(root, 'Mig1000000000001', 'migration.ts');
      await fs.mkdir(path.dirname(existingFile), { recursive: true });
      await fs.writeFile(
        existingFile,
        migration(
          'Mig1000000000001',
          ['CREATE TABLE posts (id int)', 'CREATE TABLE users (id int)'],
          ['DROP TABLE something_else'],
        ),
      );

      const current = migration(
        'Mig1000000000002',
        ['CREATE TABLE users (id int)', 'CREATE TABLE posts (id int)'],
        ['DROP TABLE users', 'DROP TABLE posts'],
      );

      const result = await compareMig(
        current,
        [item('Mig1000000000001', existingFile)],
        'postgresql',
      );

      assert.ok(result);
      assert.equal(result.name, 'Mig1000000000001');
      assert.equal(result.file, existingFile);
      assert.equal(typeof result.migHash, 'string');
      assert.equal(result.hashes.length, 2);
      await fs.rm(root, { recursive: true, force: true });
    });

    it('does not treat a migration with extra up-query content as a duplicate', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-compare-'));
      const existingFile = path.join(root, 'Mig1000000000001', 'migration.ts');
      await fs.mkdir(path.dirname(existingFile), { recursive: true });
      await fs.writeFile(
        existingFile,
        migration('Mig1000000000001', ['CREATE TABLE users (id int)']),
      );

      const current = migration('Mig1000000000002', [
        'CREATE TABLE users (id int, email varchar(255))',
      ]);

      const result = await compareMig(
        current,
        [item('Mig1000000000001', existingFile)],
        'postgresql',
      );

      assert.equal(result, null);
      await fs.rm(root, { recursive: true, force: true });
    });
  });
});
