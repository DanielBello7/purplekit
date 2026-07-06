import { DataSourceOptions } from 'typeorm';
type Params = DataSourceOptions['type'];
/**
 * Returns the SQL used to list user/base tables for the given DB type.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameter-free SQL query string.
 */
declare const getDbTablesCommand: (type?: Params) => "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'" | "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'" | "SELECT name FROM sqlite_master WHERE type = 'table'" | "SELECT table_name FROM user_tables" | "SELECT TABLE_NAME AS table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
/**
 * Returns the parameterized SQL used to check whether a database exists.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameterized SQL query string.
 * @throws When the type is unsupported (e.g. SQLite uses filesystem checks).
 */
declare const getDbCheckCommand: (type?: Params) => "SELECT 1 FROM pg_database WHERE DATNAME = $1" | "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?" | "SELECT name FROM sys.databases WHERE name = @0" | "SELECT username FROM all_users WHERE username = :1";
/**
 * Returns the SQL used to drop a database for the given DB type.
 *
 * @param name - Database name to drop.
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameterized or literal SQL query string.
 * @throws When the type is unsupported.
 */
declare const getDropDbCommand: (name: string, type?: Params) => string;
/**
 * Returns the SQL used to create a database for the given DB type.
 *
 * @param name - Database name to create.
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Literal SQL query string for creating the database.
 * @throws When the type is unsupported.
 */
declare const getCreateDbCommand: (name: string, type?: Params) => string;
/**
 * Returns the parameterized SQL used to check if a migration has been applied.
 *
 * @param type - Database driver type; defaults to `cfg.TYPE`.
 * @returns Parameterized SQL query string for TypeORM's `migrations` table.
 * @throws When the type is unsupported.
 */
declare const getCheckMigrationCommand: (type?: Params) => "SELECT 1 FROM migrations WHERE name = $1 LIMIT 1" | "SELECT 1 FROM migrations WHERE name = ? LIMIT 1" | "SELECT TOP 1 1 FROM migrations WHERE name = @0";
export { getDbTablesCommand, getDbCheckCommand, getDropDbCommand, getCreateDbCommand, getCheckMigrationCommand, };
//# sourceMappingURL=get-commands.d.ts.map