import { describe, it } from 'mocha';
import { strict as assert } from 'node:assert';
import { cfg } from '@/config';
import { createDataSource } from '@/libs/create-ds';

describe('create-ds library', () => {
  it('creates a TypeORM datasource using the configured connection options', () => {
    const ds = createDataSource();
    const options = ds.options as any;

    assert.equal(options.username, cfg.DATABASE_USERNAME);
    assert.equal(options.host, cfg.DATABASE_HOST);
    assert.equal(options.port, cfg.DATABASE_PORT);
    assert.equal(options.type, cfg.TYPE);
  });

  it('defaults the database to the configured initial database', () => {
    const ds = createDataSource();

    assert.equal(ds.options.database, cfg.INITIAL_DATABASE);
  });

  it('allows the database to be overridden', () => {
    const ds = createDataSource({ database: 'target_db' });

    assert.equal(ds.options.database, 'target_db');
  });

  it('allows migrations to be overridden', () => {
    const ds = createDataSource({ migrations: ['src/custom/**/*.ts'] });

    assert.deepEqual(ds.options.migrations, ['src/custom/**/*.ts']);
  });

  it('includes configured entities and migrations by default', () => {
    const ds = createDataSource();

    assert.deepEqual(ds.options.entities, cfg.ENTITIES);
    assert.deepEqual(ds.options.migrations, cfg.MIGRATIONS);
  });

  it('omits SSL extra options when SSL mode is disabled', () => {
    const ds = createDataSource();
    const options = ds.options as any;

    assert.equal(options.ssl, false);
    assert.equal(options.extra, undefined);
  });
});
