import { DB_STATUS } from '../types';
import { MigrationItem } from './migrate';
import { MigrationDuplicate } from '../libs/compare-mig';
/**
 * Splits local migration files into applied and pending groups for a database.
 *
 * @param name - Optional target database name.
 * @returns Applied and pending local migration file metadata.
 */
declare const migrationStatus: (name?: string) => Promise<{
    applied: MigrationItem[];
    pending: MigrationItem[];
}>;
/**
 * Detects local migration files with equivalent normalized `up` SQL.
 *
 * @returns Total migration file count and duplicate matches.
 */
declare const checkForDuplicateMig: () => Promise<{
    total: number;
    checks: (MigrationItem & {
        duplicateOf: MigrationDuplicate;
    })[];
}>;
/**
 * Checks whether a database with the given name exists.
 * Connects via the default data source and runs a dialect-specific query.
 *
 * @param name - Database name to check (expected to be sanitized).
 * @returns Whether the database exists; includes `error` when the check fails.
 */
declare const doesDbExists: (name: string) => Promise<{
    databaseOk: boolean;
    dbName: string;
} & Record<string, any>>;
/**
 * Inspects a target database and returns its public/base table count.
 * Opens a dedicated TypeORM data source pointed at `name`.
 *
 * @param db - Database to inspect.
 * @returns Table count on success; `tables: 0` and `err` on failure.
 */
declare const dbStatus: (db: string) => Promise<{
    tables: number;
} & Record<string, any>>;
/**
 * CLI handler for the `status` command.
 * Checks database existence and, if it exists, reports the table count.
 * Prints a JSON object to stdout.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
declare const status: (args: DB_STATUS) => Promise<never>;
export { status, dbStatus, doesDbExists, migrationStatus, checkForDuplicateMig, };
//# sourceMappingURL=status.d.ts.map