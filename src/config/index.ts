import { CONFIGURATIONS } from '@/types';

const cfg: CONFIGURATIONS = {
  ENTITIES: ['src/**/*.schema.ts'],
  MIGRATIONS: ['src/db/migrations/**/*.ts'],
  TYPE: 'postgres',
  SSL_MODE: false,
  SSL_TYPE: 'light',
  DATABASE_CA_CERT: './',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  DATABASE_USERNAME: 'danielbello',
  DATABASE_PASSWORD: '',
  DATABASE_NAME: 'tsq',
  SYNCHRONIZE: false,
  LOGGING: false,
  INITIAL_DATABASE: 'postgres',
};

export { cfg };
