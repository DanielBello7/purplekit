import { getMetadata, hasSchemaChanges, saveMig } from '@/db/features/gen';
import { schemaBuilderResult } from 'tests/helpers/schema-builder';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('gen feature', () => {
  describe('hasSchemaChanges', () => {
    it('uses TypeORM schema builder log output to detect pending schema changes', async () => {
      let called = false;
      const ds = {
        driver: {
          createSchemaBuilder: () => ({
            log: async () => {
              called = true;
              return { upQueries: [], downQueries: [] };
            },
          }),
        },
      };

      await hasSchemaChanges(ds as any);

      assert.equal(called, true);
    });

    it('returns true when up queries are present', async () => {
      const ds = schemaBuilderResult({
        upQueries: ['create table users'],
        downQueries: [],
      });

      const result = await hasSchemaChanges(ds as any);

      assert.equal(result, true);
    });

    it('returns true when down queries are present', async () => {
      const ds = schemaBuilderResult({
        upQueries: [],
        downQueries: ['drop table users'],
      });

      const result = await hasSchemaChanges(ds as any);

      assert.equal(result, true);
    });

    it('returns false when no up or down queries are present', async () => {
      const ds = schemaBuilderResult({ upQueries: [], downQueries: [] });

      const result = await hasSchemaChanges(ds as any);

      assert.equal(result, false);
    });
  });

  describe('getMetadata', () => {
    it('creates a timestamped migration title', () => {
      const metadata = getMetadata('CreateUsers');

      assert.match(metadata.filename, /^CreateUsers\d{13}$/);
    });

    it('uses Mig as the default migration name prefix', () => {
      const metadata = getMetadata();

      assert.match(metadata.filename, /^Mig\d{13}$/);
    });

    it('uses the provided migration name prefix when supplied', () => {
      const metadata = getMetadata('AddPosts');

      assert.equal(metadata.migrationName, 'AddPosts');
    });

    it('returns the expected Prisma-style migration file location', () => {
      const metadata = getMetadata('AddPosts');

      assert.equal(
        metadata.location,
        `src/db/migrations/${metadata.filename}/migration.ts`,
      );
    });
  });

  describe('saveMig', () => {
    it('creates the migration directory recursively', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-save-'));
      const location = path.join(
        root,
        'NestedMigration1000000000001',
        'migration.ts',
      );

      await saveMig(location, 'content');

      const stat = await fs.stat(path.dirname(location));
      assert.equal(stat.isDirectory(), true);
      await fs.rm(root, { recursive: true, force: true });
    });

    it('writes the migration content to migration.ts', async () => {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-save-'));
      const location = path.join(
        root,
        'NestedMigration1000000000001',
        'migration.ts',
      );

      await saveMig(location, 'export class Migration {}');

      assert.equal(
        await fs.readFile(location, 'utf-8'),
        'export class Migration {}',
      );
      await fs.rm(root, { recursive: true, force: true });
    });
  });

  describe('generate', () => {
    it('connects to the requested target database');
    it(
      'returns no-changes when TypeORM reports no schema changes and force is false',
    );
    it('continues generation when force is true even without schema changes');
    it('checks generated content against existing migrations before saving');
    it(
      'returns duplicate-found when an existing migration has the same normalized up queries',
    );
    it('does not save the migration when save is false');
    it('saves the migration when save is true');
    it('returns formatted migration content on success');
    it('destroys the datasource after successful generation');
    it('destroys the datasource when generation fails');
  });

  describe('gen cli handler', () => {
    it('uses the configured database name as the generation target');
    it('sanitizes the provided migration name');
    it('passes force through to generate');
    it('saves generated migration files');
    it('prints a no-changes message when no schema changes exist');
    it('prints a duplicate message when duplicate generation is blocked');
    it('prints a success message when a migration is created');
    it('prints an error and exits with code 1 when generation fails');
  });
});
