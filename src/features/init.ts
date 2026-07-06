import { cfg } from '@/config';
import { PURPLEKIT_CONFIG_TS } from '@/config/constants';
import { print } from '@/libs/print';
import * as fs from 'fs/promises';

const template = `import type { PURPLEKIT_CONFIGURATIONS } from 'purplekit';

const config: PURPLEKIT_CONFIGURATIONS = {
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

export default config;
`;

/**
 * Ensures a directory exists without failing when it is already present.
 *
 * @param path - Directory path to create.
 */
async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Writes a file only when it does not already exist.
 *
 * @param path - File path to create.
 * @param content - Initial file content.
 */
async function ensureFile(path: string, content: string = '') {
  try {
    await fs.writeFile(path, content, { flag: 'wx' });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'EEXIST') return;
    throw e;
  }
}

/**
 * Creates Purplekit's opinionated project structure and starter config.
 * Existing files are preserved so the command can be rerun safely.
 */
async function init() {
  print('initializing app');
  await ensureDir(cfg.ROOT);
  await ensureDir(cfg.MIGRATIONS_DIR);
  await ensureDir(cfg.SEEDS_DIR);

  await ensureFile(`${cfg.ROOT}/.gitkeep`);
  await ensureFile(`${cfg.MIGRATIONS_DIR}/.gitkeep`);
  await ensureFile(`${cfg.SEEDS_DIR}/.gitkeep`);

  await ensureFile(PURPLEKIT_CONFIG_TS, template);
  print('initialized');
}

export { init };
