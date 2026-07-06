import { checkForDuplicateMig } from '@/features/status';
import { cfg } from '@/config';
import { migration } from '../helpers/migration-gen';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('status feature', () => {
  describe('checkForDuplicateMig', () => {
    let cwd: string;
    let tempRoot: string;

    beforeEach(async () => {
      cwd = process.cwd();
      tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'purplekit-status-'));
      process.chdir(tempRoot);
    });

    afterEach(async () => {
      process.chdir(cwd);
      await fs.rm(tempRoot, { recursive: true, force: true });
    });

    async function writeMigration(name: string, queries: string[]) {
      const file = path.join(cfg.MIGRATIONS_DIR, name, 'migration.ts');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, migration(name, queries));
      return file;
    }

    it('returns zero totals when there are no migration files', async () => {
      const result = await checkForDuplicateMig();

      assert.deepEqual(result, { total: 0, checks: [] });
    });

    it('returns the total number of migration files checked', async () => {
      await writeMigration('CreateUsers1000000000001', [
        'CREATE TABLE users (id int)',
      ]);
      await writeMigration('CreatePosts1000000000002', [
        'CREATE TABLE posts (id int)',
      ]);

      const result = await checkForDuplicateMig();

      assert.equal(result.total, 2);
    });

    it('reports migrations with equivalent normalized up queries', async () => {
      await writeMigration('CreateUsers1000000000001', [
        'CREATE TABLE users (id int)',
        'CREATE TABLE posts (id int)',
      ]);
      await writeMigration('CreateUsersAgain1000000000002', [
        'CREATE TABLE posts (id int)',
        'CREATE TABLE users (id int)',
      ]);

      const result = await checkForDuplicateMig();

      assert.equal(result.total, 2);
      assert.equal(result.checks.length, 2);
      assert.deepEqual(
        result.checks.map((item) => item.name).sort(),
        ['CreateUsers1000000000001', 'CreateUsersAgain1000000000002'],
      );
      assert.ok(
        result.checks.every((item) => item.duplicateOf.name !== item.name),
      );
    });
  });
});
