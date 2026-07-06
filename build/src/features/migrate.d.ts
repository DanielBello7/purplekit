import { MIGRATE } from '../types';
import { DataSource } from 'typeorm';
type MigrationResult = {
    migrated: boolean;
    status: 'migrated' | 'already-migrated' | 'no-migrations';
};
export type MigrationItem = {
    name: string;
    parentPath: string;
    exists: boolean;
    file: string;
};
/**
 * Lists migration directories under the configured migrations directory and whether each
 * contains a `migration.ts` file.
 *
 * @returns An array of {@link MigrationItem} entries, one per migration folder.
 */
declare function getMigrationFiles(): Promise<MigrationItem[]>;
/**
 * Checks whether a migration has already been recorded in the database.
 * Queries the `migrations` table via a dialect-specific command.
 *
 * @param ds - Initialized TypeORM data source.
 * @param name - Migration folder name to look up.
 * @returns Whether the migration name exists in the migrations table.
 */
declare function hasMigration(ds: DataSource, name: string): Promise<boolean>;
/**
 * Resolves which local migrations still need to run against the database.
 * Opens a data source, discovers migration folders (optionally
 * scoped to `name`), and filters out entries that are missing or already recorded.
 *
 * @param name - Optional migration folder name; when omitted, all folders are considered.
 * @param db - Optional database override for the migration lookup.
 * @returns Pending {@link MigrationItem} entries; empty when none apply.
 * @throws When the data source cannot connect or migration lookup fails.
 */
declare function getMigrationsToRun(name?: string, db?: string): Promise<MigrationItem[]>;
/**
 * Runs pending migrations discovered via {@link getMigrationsToRun}.
 * When `name` is omitted, runs every unmigrated folder under the configured migrations directory.
 *
 * @param name - Optional migration folder name to run a single migration.
 * @param db - Optional database override for migration discovery and execution.
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When migration discovery or execution fails.
 */
declare function runMigrationByName(name?: string, db?: string): Promise<MigrationResult>;
/**
 * Runs all migrations registered on the configured TypeORM data source.
 * Initializes the data source, executes pending migrations in a single
 * transaction, then destroys the connection.
 *
 * @param db - Optional database override for the TypeORM data source.
 * @returns Outcome with `migrated` flag and status (`migrated` or `no-migrations`).
 * @throws When initialization or migration execution fails.
 */
declare function runMigrationByConfig(db?: string): Promise<MigrationResult>;
/**
 * Resolves a migration folder name and `migration.ts` path from a CLI path input.
 * Accepts either a migration directory or a direct path to `migration.ts`.
 * Validates that the folder name is class-style and ends with a 13-digit timestamp.
 *
 * @param input - Migration folder or file path from `--file`.
 * @returns The migration name and normalized path to `migration.ts`.
 * @throws When the name is invalid or the migration file does not exist.
 */
declare function getMigrationNameFromPath(input: string): {
    name: string;
    path: string;
};
/**
 * CLI handler for the `migrate` command.
 * Runs pending migrations via {@link runMigrationByName}. When `--file` is
 * provided, resolves the migration name from the path first.
 * Prints the outcome to stdout and exits with code 0 or 1.
 *
 * @param args - CLI options; `--name` scopes to one migration folder, `--file` to a folder or `migration.ts` path.
 */
declare function migrate(args: MIGRATE): Promise<void>;
export { migrate, runMigrationByConfig, runMigrationByName, getMigrationsToRun, hasMigration, getMigrationFiles, getMigrationNameFromPath, };
//# sourceMappingURL=migrate.d.ts.map