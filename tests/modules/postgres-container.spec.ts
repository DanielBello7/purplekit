import { strict as assert } from 'node:assert';
import { create, createdb } from '@/features/createdb';
import { drop } from '@/features/dropdb';
import { doesDbExists } from '@/features/status';
import { cfg } from '@/config';
import { PostgresTestContainer } from '../container';

const runContainerTests = process.env.TGX_PG_CONTAINER_TESTS === '1';
const describeContainer = runContainerTests ? describe : describe.skip;

describeContainer('postgres container integration', function () {
  this.timeout(120_000);

  const originalCfg = { ...cfg };
  const pg = new PostgresTestContainer();

  before(async function () {
    try {
      await pg.start();
      pg.applyToConfig();
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      if (msg.includes('container runtime')) {
        this.skip();
      }

      throw e;
    }
  });

  after(async () => {
    Object.assign(cfg, originalCfg);
    await pg.stop();
  });

  it('starts a Postgres container and accepts queries', async () => {
    const client = await pg.getClient();
    const result = await client.query('select current_database() as db');

    assert.equal(result.rows[0].db, 'app_test');
  });

  it('creates, detects, and drops a database through the feature helpers', async () => {
    const name = 'tgx_container_createdb';

    await drop(name);

    const created = await create(name);
    const existsAfterCreate = await doesDbExists(name);
    const duplicate = await create(name);
    const dropped = await drop(name);
    const existsAfterDrop = await doesDbExists(name);

    assert.deepEqual(created, { status: 'created', created: true });
    assert.equal(existsAfterCreate.databaseOk, true);
    assert.deepEqual(duplicate, { status: 'already-exists', created: false });
    assert.deepEqual(dropped, { dropped: true });
    assert.equal(existsAfterDrop.databaseOk, false);
  });

  it('keeps cli handlers separate from direct helper integration tests', () => {
    assert.equal(typeof createdb, 'function');
  });
});
