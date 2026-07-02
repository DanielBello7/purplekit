import { MigrationItem } from '@/db/features/migrate';
import { Parser } from 'node-sql-parser';
import crypto from 'node:crypto';
import * as fs from 'node:fs';

export type MigrationDuplicate = {
  file: string;
  name: string;
  migHash: string;
  hashes: string[];
};

// prettier-ignore
type SqlDialect = 
  |'postgresql' 
  | 'mysql' 
  | 'mariadb' 
  | 'sqlite' 
  | 'transactsql';

function getMethodBody(content: string, method: 'up' | 'down'): string {
  // prettier-ignore
  const pattern = new RegExp(`(?:public\\s+|private\\s+|protected\\s+)?(?:async\\s+)?${method}\\s*\\([^)]*\\)\\s*(?::\\s*[^\\{]+)?\\{`);
  const match = pattern.exec(content);
  if (!match) return '';

  const start = match.index + match[0].length;
  let depth = 1;

  for (let i = start; i < content.length; i++) {
    const char = content[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return content.slice(start, i);
  }

  return '';
}

/**
 * Maps a TypeORM driver type to a `node-sql-parser` dialect name.
 *
 * @param type - TypeORM data source type (e.g. `postgres`, `mysql`).
 * @returns SQL parser dialect; defaults to `postgresql` when unknown.
 */
function getParserDialect(type: string): SqlDialect {
  switch (type) {
    case 'postgres':
      return 'postgresql';
    case 'mysql':
    case 'mariadb':
      return 'mysql';
    case 'sqlite':
    case 'better-sqlite3':
      return 'sqlite';
    case 'mssql':
      return 'transactsql';
    default:
      return 'postgresql';
  }
}

/**
 * Recursively sorts object keys so AST JSON serialization is stable.
 *
 * @param value - Value to normalize (object, array, or primitive).
 * @returns A copy with sorted keys at every object level.
 */
function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce(
        (a, b) => {
          a[b] = sortObjectKeys((value as Record<string, unknown>)[b]);
          return a;
        },
        {} as Record<string, unknown>,
      );
  }
  return value;
}

/**
 * Parses SQL into an AST and returns a canonical JSON representation.
 *
 * @param sql - Raw SQL string from a migration query.
 * @param dialect - Parser dialect for the target database.
 * @returns Normalized AST as a JSON string.
 * @throws When the SQL cannot be parsed.
 */
function normalizeSqlAst(sql: string, dialect: SqlDialect): string {
  try {
    const parser = new Parser();
    const ast = parser.astify(sql, { database: dialect });
    const normalized = sortObjectKeys(ast);
    return JSON.stringify(normalized);
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    throw new Error(`Error parsing sql: ${msg}`);
  }
}

/**
 * Extracts raw SQL strings from a TypeORM migration file body.
 * Matches `queryRunner.query(\`...\`)` template-literal calls.
 *
 * @param content - Migration file source text.
 * @returns SQL query strings in file order.
 */
function getMigQueries(content: string): string[] {
  // prettier-ignore
  const regex = new RegExp(/queryRunner\.query\(\s*`([\s\S]*?)`\s*(?:,\s*[\s\S]*?)?\)/g);
  const body = getMethodBody(content, 'up');
  const queries: string[] = [];

  for (const match of body.matchAll(regex)) {
    const sql = match[1];
    if (sql) queries.push(sql);
  }
  return queries;
}

/**
 * Builds a combined AST signature for all queries in a migration file.
 *
 * @param content - Migration file source text.
 * @param dialect - Parser dialect for the target database.
 * @returns Normalized AST strings joined by a delimiter.
 */
function getMigAstSignatures(content: string, dialect: SqlDialect): string[] {
  const queries = getMigQueries(content);
  return queries.map((q) => normalizeSqlAst(q, dialect));
}

/**
 * Computes a SHA-256 hex digest of a string.
 *
 * @param value - Input to hash.
 * @returns Hex-encoded SHA-256 hash.
 */
function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Hashes the canonical AST signature of a migration file's up queries.
 *
 * @param content - Migration file source text.
 * @param dialect - Parser dialect for the target database.
 * @returns SHA-256 hash of the migration's normalized AST signature.
 */
function getMigAstHashes(
  content: string,
  dialect: SqlDialect,
): { migHash: string; hashes: string[] } {
  const res = getMigAstSignatures(content, dialect);
  const hashes = res.map((r) => hash(r));
  const migHash = hash([...hashes].sort().join('\n'));

  return { migHash, hashes };
}

/**
 * Compares a generated migration against existing files by AST hash.
 * Returns the first existing migration whose queries normalize to the same signature.
 *
 * @param current - Source text of the newly generated migration.
 * @param existing - Local migration folders to compare against.
 * @param dialect - Parser dialect for the target database.
 * @returns Duplicate match with file path and hash, or `null` when unique.
 * @throws Not yet implemented.
 */
async function compareMig(
  current: string,
  existing: MigrationItem[],
  dialect: SqlDialect,
): Promise<MigrationDuplicate | null> {
  const newHash = getMigAstHashes(current, dialect);

  for (const f of existing) {
    const existingContent = await fs.promises.readFile(f.file, 'utf-8');
    const existingHash = getMigAstHashes(existingContent, dialect);

    if (existingHash.migHash === newHash.migHash) {
      return {
        file: f.file,
        name: f.name,
        ...existingHash,
      };
    }
  }

  return null;
}

export { compareMig, getParserDialect };
