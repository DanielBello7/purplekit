import {
  getMigrationFiles,
  getMigrationNameFromPath,
  hasMigration,
} from '@/features/migrate';
import { cfg } from '@/config';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('migrate feature', () => {
  describe('getMigrationFiles', () => {
    const root = cfg.MIGRATIONS_DIR;
    const fixtureName = 'SpecMigration1000000000001';
    const fixtureDir = path.join(root, fixtureName);
    const fixtureFile = path.join(fixtureDir, 'migration.ts');
    let cwd: string;
    let tempRoot: string;

    beforeEach(async () => {
      cwd = process.cwd();
      tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-migrate-'));
      process.chdir(tempRoot);
      await fs.mkdir(fixtureDir, { recursive: true });
      await fs.writeFile(
        fixtureFile,
        'export class SpecMigration1000000000001 {}',
      );
    });

    afterEach(async () => {
      process.chdir(cwd);
      await fs.rm(tempRoot, { recursive: true, force: true });
    });

    it('lists migration directories under the configured migrations directory', async () => {
      const files = await getMigrationFiles();

      assert.ok(files.some((file) => file.name === fixtureName));
    });

    it('includes only directories that contain migration.ts', async () => {
      const emptyDir = path.join(root, 'SpecEmpty1000000000002');
      await fs.mkdir(emptyDir, { recursive: true });

      const files = await getMigrationFiles();

      assert.equal(
        files.some((file) => file.name === 'SpecEmpty1000000000002'),
        false,
      );
      await fs.rm(emptyDir, { recursive: true, force: true });
    });

    it('returns migration name, parentPath, file, and exists metadata', async () => {
      const files = await getMigrationFiles();
      const fixture = files.find((file) => file.name === fixtureName);

      assert.ok(fixture);
      assert.equal(fixture.name, fixtureName);
      assert.equal(fixture.file, fixtureFile);
      assert.equal(fixture.parentPath, root);
      assert.equal(fixture.exists, true);
    });
  });

  describe('getMigrationNameFromPath', () => {
    let cwd: string;
    let tempRoot: string;
    const name = 'CreateUsers1000000000001';

    beforeEach(async () => {
      cwd = process.cwd();
      tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-mig-path-'));
      process.chdir(tempRoot);
      await fs.mkdir(path.join(cfg.MIGRATIONS_DIR, name), { recursive: true });
      await fs.writeFile(
        path.join(cfg.MIGRATIONS_DIR, name, 'migration.ts'),
        'export class CreateUsers1000000000001 {}',
      );
    });

    afterEach(async () => {
      process.chdir(cwd);
      await fs.rm(tempRoot, { recursive: true, force: true });
    });

    it('accepts a migration directory path', () => {
      const result = getMigrationNameFromPath(path.join(cfg.MIGRATIONS_DIR, name));

      assert.equal(result.name, name);
      assert.equal(
        result.path,
        path.join(cfg.MIGRATIONS_DIR, name, 'migration.ts'),
      );
    });

    it('accepts a direct migration.ts path', () => {
      const file = path.join(cfg.MIGRATIONS_DIR, name, 'migration.ts');

      const result = getMigrationNameFromPath(file);

      assert.deepEqual(result, { name, path: file });
    });

    it('rejects folder names that are not class-style timestamped migration names', () => {
      assert.throws(
        () => getMigrationNameFromPath(path.join(cfg.MIGRATIONS_DIR, 'bad-name')),
        /Invalid migration name/,
      );
    });

    it('throws when the resolved migration.ts file does not exist', () => {
      assert.throws(
        () =>
          getMigrationNameFromPath(
            path.join(cfg.MIGRATIONS_DIR, 'CreatePosts1000000000002'),
          ),
        /doesn't exist/,
      );
    });
  });

  describe('hasMigration', () => {
    it('runs the dialect-specific migration lookup query', async () => {
      const calls: unknown[][] = [];
      const ds = {
        query: async (...args: unknown[]) => {
          calls.push(args);
          return [{ '?column?': 1 }];
        },
      };

      const result = await hasMigration(ds as any, 'Mig1000000000001');

      assert.equal(result, true);
      assert.equal(calls.length, 1);
      const firstCall = calls[0];
      assert.ok(firstCall);
      assert.match(firstCall[0] as string, /FROM migrations/);
      assert.deepEqual(firstCall[1], ['Mig1000000000001']);
    });

    it('returns false when the migration is not found', async () => {
      const ds = { query: async () => [] };

      const result = await hasMigration(ds as any, 'Mig1000000000001');

      assert.equal(result, false);
    });

    it('returns false when the migrations table does not exist', async () => {
      const error = Object.assign(
        new Error('relation "migrations" does not exist'),
        {
          code: '42P01',
        },
      );
      const ds = {
        query: async () => {
          throw error;
        },
      };

      const result = await hasMigration(ds as any, 'Mig1000000000001');

      assert.equal(result, false);
    });

    it('rethrows database errors that are not missing-table errors', async () => {
      const error = Object.assign(new Error('permission denied'), {
        code: '42501',
      });
      const ds = {
        query: async () => {
          throw error;
        },
      };

      await assert.rejects(
        () => hasMigration(ds as any, 'Mig1000000000001'),
        /permission denied/,
      );
    });
  });
});
