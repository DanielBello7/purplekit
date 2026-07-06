import {
  getMigrationFile,
  getMigrationLocation,
  getMigrationRoot,
} from '@/libs/paths';
import { cfg } from '@/config';
import { strict as assert } from 'node:assert';
import * as path from 'node:path';

describe('paths library', () => {
  it('uses the opinionated tgx migrations root', () => {
    assert.equal(getMigrationRoot(), 'tgx/migrations');
    assert.equal(getMigrationRoot(), cfg.MIGRATIONS_DIR);
  });

  it('builds the canonical migration.ts path for a migration name', () => {
    assert.equal(
      getMigrationFile('CreateUsers1000000000001'),
      path.join('tgx/migrations', 'CreateUsers1000000000001', 'migration.ts'),
    );
  });

  it('uses the same location for generated migration output', () => {
    assert.equal(
      getMigrationLocation('CreatePosts1000000000002'),
      getMigrationFile('CreatePosts1000000000002'),
    );
  });
});
