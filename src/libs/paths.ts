import { cfg } from '@/config';
import path from 'path';

/**
 * Returns the opinionated migrations root used by TGX.
 *
 * @returns Configured migrations directory.
 */
function getMigrationRoot() {
  return cfg.MIGRATIONS_DIR;
}

/**
 * Builds the canonical `migration.ts` path for a migration folder name.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Path to that migration's `migration.ts` file.
 */
function getMigrationFile(name: string) {
  return path.join(getMigrationRoot(), name, 'migration.ts');
}

/**
 * Returns the file location where a generated migration should be saved.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Generated migration file location.
 */
function getMigrationLocation(name: string) {
  return getMigrationFile(name);
}

export { getMigrationFile, getMigrationLocation, getMigrationRoot };
