import { PURPLEKIT_CONFIGURATIONS, PURPLEKIT_INTERNAL_CONFIGURATIONS } from '@/types';
import {
  PURPLEKIT_CONFIG_JS,
  PURPLEKIT_CONFIG_TS,
  PURPLEKIT_MIGRATIONS_DIR,
  PURPLEKIT_MIGRATIONS_GLOB,
  PURPLEKIT_ROOT,
  PURPLEKIT_SEEDS_DIR,
} from './constants';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

const requireConfig = createRequire(path.join(process.cwd(), 'purplekit.config.cjs'));

const defaults: PURPLEKIT_CONFIGURATIONS = {
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
 * Loads the user-authored Purplekit config from the opinionated project config path.
 * Supports TypeScript and JavaScript config files and returns an empty object
 * when no config file has been initialized yet.
 *
 * @returns Partial user config to merge over defaults.
 */
function loadUserConfig(): Partial<PURPLEKIT_CONFIGURATIONS> {
  for (const file of [PURPLEKIT_CONFIG_TS, PURPLEKIT_CONFIG_JS]) {
    const location = path.resolve(process.cwd(), file);
    if (!existsSync(location)) continue;

    const mod = requireConfig(location) as {
      default?: Partial<PURPLEKIT_CONFIGURATIONS>;
    } & Partial<PURPLEKIT_CONFIGURATIONS>;

    return mod.default ?? mod;
  }

  return {};
}

const userConfig = loadUserConfig();

const cfg: PURPLEKIT_INTERNAL_CONFIGURATIONS = {
  ...defaults,
  ...userConfig,
  ROOT: PURPLEKIT_ROOT,
  MIGRATIONS_DIR: PURPLEKIT_MIGRATIONS_DIR,
  SEEDS_DIR: PURPLEKIT_SEEDS_DIR,
  MIGRATIONS: [PURPLEKIT_MIGRATIONS_GLOB],
};

export { cfg };
