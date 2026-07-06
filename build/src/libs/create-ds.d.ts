import { DataSourceOptions, DataSource } from 'typeorm';
/**
 * Builds a TypeORM `DataSource` from app config, with optional overrides.
 *
 * @param opt - Partial options merged on top of defaults (e.g. `{ database: name }`).
 * @returns A configured, uninitialized TypeORM data source.
 */
declare const createDataSource: (opt?: Partial<DataSourceOptions>) => DataSource;
export { createDataSource };
//# sourceMappingURL=create-ds.d.ts.map