import { CREATE_DB } from '../types';
/**
 * Creates a database if it does not already exist.
 * Idempotent — safe to run multiple times with the same name.
 *
 * @param name - Database name to create (expected to be sanitized).
 * @returns Outcome status and whether the database was created.
 */
declare function create(name: string): Promise<{
    status: 'created' | 'already-exists';
    created: boolean;
    error?: string;
}>;
/**
 * CLI handler for the `createdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
declare function createdb(args: CREATE_DB): Promise<void>;
export { createdb, create };
//# sourceMappingURL=createdb.d.ts.map