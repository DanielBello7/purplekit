import { DataSourceOptions, DataSource } from 'typeorm';
import { cfg } from '@/config';
import * as fs from 'fs';

/**
 * Builds a TypeORM `DataSource` from app config, with optional overrides.
 *
 * @param opt - Partial options merged on top of defaults (e.g. `{ database: name }`).
 * @returns A configured, uninitialized TypeORM data source.
 */
const createDataSource = (opt: Partial<DataSourceOptions> = {}) => {
  return new DataSource({
    username: cfg.DATABASE_USERNAME,
    password: cfg.DATABASE_PASSWORD,
    host: cfg.DATABASE_HOST,
    port: cfg.DATABASE_PORT,
    type: cfg.TYPE as any,
    database: cfg.INITIAL_DATABASE,
    entities: cfg.ENTITIES,
    migrations: cfg.MIGRATIONS,
    ssl: cfg.SSL_MODE,
    extra: cfg.SSL_MODE
      ? {
          ssl: {
            rejectUnauthorized: false,
            ...(cfg.SSL_TYPE === 'heavy'
              ? { ca: fs.readFileSync(cfg.DATABASE_CA_CERT) }
              : {}),
          },
        }
      : undefined,
    synchronize: cfg.SYNCHRONIZE,
    logging: cfg.LOGGING,
    ...(opt as any),
  });
};

export { createDataSource };
