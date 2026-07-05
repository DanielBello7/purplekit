import { EntitySchema, MixedList, DataSourceOptions } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export type GENERATE_MIGRATIONS = {
  name?: string;
  force?: boolean;
};

export type CREATE_DB = {
  name?: string;
};

export type DB_STATUS = {
  name?: string;
};

export type DROP_DB = {
  name?: string;
};

export type MIGRATE = {
  name?: string;
  file?: string;
  db?: string;
};

export type MIGRATION = {
  all?: boolean;
};

export type SEED = {
  db?: string;
};

export type TGX_CONFIGURATIONS = {
  TYPE: DataSourceOptions['type'];
  ENTITIES: MixedList<string | Function | EntitySchema<any>>;
  SEEDS: (new () => Seeder)[];

  SSL_TYPE: 'light' | 'heavy';
  SSL_MODE: boolean;
  DATABASE_CA_CERT: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  SYNCHRONIZE: boolean;
  LOGGING: boolean;
  INITIAL_DATABASE: string;
};

export type TGX_INTERNAL_CONFIGURATIONS = TGX_CONFIGURATIONS & {
  ROOT: string;
  MIGRATIONS_DIR: string;
  SEEDS_DIR: string;
  MIGRATIONS: MixedList<string | Function>;
};
