import { GENERATE_MIGRATIONS } from '../types';
import { DataSource } from 'typeorm';
import { compareMig } from '../libs/compare-mig';
type MoreInfo = {
    title: string;
    saved: boolean;
    timestamp: number;
    location: string;
};
type Success = {
    generated: true;
    more: MoreInfo & {
        content: string;
    };
};
type Failure = {
    generated: false;
    more: {
        reason: 'duplicate-found' | 'no-changes';
        duplicateOf?: string;
    } & MoreInfo;
};
type GeneratReturn = Success | Failure;
/**
 * Detects pending schema changes by diffing entities against the database.
 *
 * @param ds - Initialized TypeORM data source.
 * @returns Whether up or down migration queries would be generated.
 */
declare const hasSchemaChanges: (ds: DataSource) => Promise<boolean>;
/**
 * Generates a migration preview from an initialized data source and formats it.
 *
 * @param ds - Initialized TypeORM data source to diff against.
 * @param name - Migration class/name prefix.
 * @param timestamp - Timestamp suffix TypeORM uses in the migration class.
 * @returns Generated source, formatted source, and whether schema changes exist.
 */
declare const genMig: (ds: DataSource, name: string, timestamp: number) => Promise<{
    content: string;
    formatted: string;
    hasChanges: boolean;
}>;
/**
 * Persists a generated migration file, creating its parent folder first.
 *
 * @param location - Destination `migration.ts` path.
 * @param content - TypeScript migration source to write.
 */
declare const saveMig: (location: string, content: string) => Promise<undefined>;
/**
 * Builds the generated migration name and location metadata.
 *
 * @param name - Optional migration name prefix; defaults to `Mig`.
 * @returns Timestamped filename, TypeORM migration name, and target file path.
 */
declare const getMetadata: (name?: string) => {
    location: string;
    filename: string;
    migrationName: string;
    timestamp: number;
};
type GenerateParams = {
    db: string;
    force: boolean | undefined;
    name: string | undefined;
    save: boolean | undefined;
};
/**
 * Generates a migration file from current entity schemas.
 *
 * @param params - Generation options including target database, force flag,
 * migration name prefix, and whether to save the file.
 * @returns Generation outcome including title and whether changes were found.
 */
declare const generate: (params?: Partial<GenerateParams>) => Promise<GeneratReturn>;
/**
 * CLI handler for the `gen` command.
 *
 * @param args - CLI options for migration name and force flag.
 */
declare const gen: (args: GENERATE_MIGRATIONS) => Promise<never>;
export { gen, generate, genMig, compareMig, getMetadata, saveMig, hasSchemaChanges, };
//# sourceMappingURL=gen.d.ts.map