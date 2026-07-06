import { DROP_DB } from '../types';
/**
 * Drops a database if it exists.
 *
 * @param name - Database name to drop (expected to be sanitized).
 * @returns Whether the drop succeeded; includes `error` on failure.
 */
declare function drop(name: string): Promise<{
    dropped: boolean;
}>;
/**
 * CLI handler for the `dropdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
declare function dropdb(args: DROP_DB): Promise<void>;
export { dropdb, drop };
//# sourceMappingURL=dropdb.d.ts.map