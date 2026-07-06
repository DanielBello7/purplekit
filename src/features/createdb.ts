import { getCreateDbCommand, getDbCheckCommand } from '@/libs/get-commands';
import { CREATE_DB } from '@/types';
import { cfg } from '@/config';
import { print, printf } from '@/libs/print';
import { sanitize } from '@/libs/sanitize';
import { createDataSource } from '@/libs/create-ds';

/**
 * Creates a database if it does not already exist.
 * Idempotent — safe to run multiple times with the same name.
 *
 * @param name - Database name to create (expected to be sanitized).
 * @returns Outcome status and whether the database was created.
 */
async function create(name: string): Promise<{
  status: 'created' | 'already-exists';
  created: boolean;
  error?: string;
}> {
  const ds = createDataSource();
  let initialized = false;
  try {
    const createCommand = getCreateDbCommand(name);
    const checksCommand = getDbCheckCommand();

    await ds.initialize();
    initialized = true;

    const rs = await ds.query(checksCommand, [name]);

    const exists = rs.length > 0;
    if (!exists) {
      await ds.query(createCommand);
      return { status: 'created', created: true };
    } else {
      return { status: 'already-exists', created: false };
    }
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unable to serialize error';
    throw new Error(err);
  } finally {
    if (initialized) {
      await ds.destroy();
    }
  }
}

/**
 * CLI handler for the `createdb` command.
 *
 * @param args - CLI options; `name` defaults to `cfg.DATABASE_NAME`.
 */
async function createdb(args: CREATE_DB) {
  const name = sanitize(args.name ?? cfg.DATABASE_NAME);
  try {
    const response = await create(name);

    if (response.status === 'created') {
      print(`Database '${name}' created successfully.`);
    } else print(`Database '${name}' already exists.`);
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unable to serialize error';
    printf(`Failed to create database '${name}': ${err}`);
    process.exit(1);
  }
}

export { createdb, create };
