/**
 * Returns the opinionated migrations root used by TGX.
 *
 * @returns Configured migrations directory.
 */
declare function getMigrationRoot(): string;
/**
 * Builds the canonical `migration.ts` path for a migration folder name.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Path to that migration's `migration.ts` file.
 */
declare function getMigrationFile(name: string): string;
/**
 * Returns the file location where a generated migration should be saved.
 *
 * @param name - Timestamped migration folder/class name.
 * @returns Generated migration file location.
 */
declare function getMigrationLocation(name: string): string;
export { getMigrationFile, getMigrationLocation, getMigrationRoot };
//# sourceMappingURL=paths.d.ts.map