import { MIGRATION } from '../types';
/**
 * Removes a generated migration folder from a `migration.ts` file location.
 *
 * @param location - Generated migration file path.
 */
declare function removeMig(location: string): Promise<void>;
type ApplyReturn = {
    applied: boolean;
    generated: boolean;
    msg: string;
};
/**
 * Generates a migration and immediately applies it to the configured database.
 * The generated file is removed when execution fails or no migration runs.
 *
 * @param all - Whether to run all configured migrations instead of only the new one.
 * @returns Result describing whether generation and application succeeded.
 */
declare function apply(all?: boolean): Promise<ApplyReturn>;
/**
 * CLI handler for the `migration` command.
 *
 * @param args - Command options, including whether to run all migrations.
 */
declare function migration(args: MIGRATION): Promise<void>;
export { migration, apply, removeMig };
//# sourceMappingURL=migration.d.ts.map