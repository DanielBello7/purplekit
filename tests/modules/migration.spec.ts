import { removeMig } from '@/features/migration';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('migration feature', () => {
  describe('removeMig', () => {
    it('removes the generated migration directory for a migration.ts location', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'purplekit-remove-'));
      const location = path.join(
        root,
        'CreateUsers1000000000001',
        'migration.ts',
      );
      await fs.mkdir(path.dirname(location), { recursive: true });
      await fs.writeFile(location, 'export class CreateUsers1000000000001 {}');

      await removeMig(location);

      await assert.rejects(() => fs.stat(path.dirname(location)), {
        code: 'ENOENT',
      });
      await fs.rm(root, { recursive: true, force: true });
    });

    it('does not throw when the generated migration directory is already missing', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'purplekit-remove-'));
      const location = path.join(
        root,
        'CreateUsers1000000000001',
        'migration.ts',
      );

      await removeMig(location);

      await fs.rm(root, { recursive: true, force: true });
    });
  });
});
