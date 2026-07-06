import { seedEntities } from '@/libs/seed-entities';
import { strict as assert } from 'node:assert';

describe('seed-entities library', () => {
  let originalLog: typeof console.log;

  beforeEach(() => {
    originalLog = console.log;
    console.log = () => undefined;
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('saves records that do not already exist', async () => {
    const saved: unknown[] = [];
    const ds = {
      getRepository: () => ({
        findOne: async () => null,
        save: async (record: unknown) => {
          saved.push(record);
        },
      }),
    };

    await seedEntities(
      ds as any,
      class User {},
      [
        { id: 'user-1', name: 'Ada' },
        { id: 'user-2', name: 'Grace' },
      ],
      'users',
    );

    assert.deepEqual(saved, [
      { id: 'user-1', name: 'Ada' },
      { id: 'user-2', name: 'Grace' },
    ]);
  });

  it('skips records that already exist by id', async () => {
    const saved: unknown[] = [];
    const seenIds: unknown[] = [];
    const ds = {
      getRepository: () => ({
        findOne: async ({ where }: any) => {
          seenIds.push(where.id);
          return where.id === 'user-1' ? { id: 'user-1' } : null;
        },
        save: async (record: unknown) => {
          saved.push(record);
        },
      }),
    };

    await seedEntities(
      ds as any,
      class User {},
      [
        { id: 'user-1', name: 'Ada' },
        { id: 'user-2', name: 'Grace' },
      ],
      'users',
    );

    assert.deepEqual(seenIds, ['user-1', 'user-2']);
    assert.deepEqual(saved, [{ id: 'user-2', name: 'Grace' }]);
  });
});
