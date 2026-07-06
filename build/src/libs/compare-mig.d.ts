import { MigrationItem } from '../features/migrate';
export type MigrationDuplicate = {
    file: string;
    name: string;
    migHash: string;
    hashes: string[];
};
type SqlDialect = 'postgresql' | 'mysql' | 'mariadb' | 'sqlite' | 'transactsql';
/**
 * Maps a TypeORM driver type to a `node-sql-parser` dialect name.
 *
 * @param type - TypeORM data source type (e.g. `postgres`, `mysql`).
 * @returns SQL parser dialect; defaults to `postgresql` when unknown.
 */
declare function getParserDialect(type: string): SqlDialect;
/**
 * Compares a generated migration against existing files by AST hash.
 * Returns the first existing migration whose `up` queries normalize to the same set.
 *
 * @param current - Source text of the newly generated migration.
 * @param existing - Local migration folders to compare against.
 * @param dialect - Parser dialect for the target database.
 * @returns Duplicate match with file path and hash, or `null` when unique.
 */
declare function compareMig(current: string, existing: MigrationItem[], dialect: SqlDialect): Promise<MigrationDuplicate | null>;
export { compareMig, getParserDialect };
//# sourceMappingURL=compare-mig.d.ts.map