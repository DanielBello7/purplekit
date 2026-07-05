import { TGX_CONFIGURATIONS, TGX_INTERNAL_CONFIGURATIONS } from '@/types';
import {
  TGX_CONFIG_JS,
  TGX_CONFIG_TS,
  TGX_MIGRATIONS_DIR,
  TGX_MIGRATIONS_GLOB,
  TGX_ROOT,
  TGX_SEEDS_DIR,
} from './constants';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

const requireConfig = createRequire(path.join(process.cwd(), 'tgx.config.cjs'));

const defaults: TGX_CONFIGURATIONS = {
  ENTITIES: ['src/**/*.schema.ts'],
  SEEDS: [],

  TYPE: 'postgres',
  SSL_MODE: false,
  SSL_TYPE: 'light',
  DATABASE_CA_CERT: './',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  DATABASE_USERNAME: 'postgres',
  DATABASE_PASSWORD: '',
  DATABASE_NAME: 'app',
  SYNCHRONIZE: false,
  LOGGING: false,
  INITIAL_DATABASE: 'postgres',
};

/**
 * Loads the user-authored TGX config from the opinionated project config path.
 * Supports TypeScript and JavaScript config files and returns an empty object
 * when no config file has been initialized yet.
 *
 * @returns Partial user config to merge over defaults.
 */
function loadUserConfig(): Partial<TGX_CONFIGURATIONS> {
  for (const file of [TGX_CONFIG_TS, TGX_CONFIG_JS]) {
    const location = path.resolve(process.cwd(), file);
    if (!existsSync(location)) continue;

    const mod = requireConfig(location) as {
      default?: Partial<TGX_CONFIGURATIONS>;
    } & Partial<TGX_CONFIGURATIONS>;

    return mod.default ?? mod;
  }

  return {};
}

const userConfig = loadUserConfig();

const cfg: TGX_INTERNAL_CONFIGURATIONS = {
  ...defaults,
  ...userConfig,
  ROOT: TGX_ROOT,
  MIGRATIONS_DIR: TGX_MIGRATIONS_DIR,
  SEEDS_DIR: TGX_SEEDS_DIR,
  MIGRATIONS: [TGX_MIGRATIONS_GLOB],
};

export { cfg };
