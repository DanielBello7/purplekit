"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareMig = compareMig;
exports.getParserDialect = getParserDialect;
const node_sql_parser_1 = require("node-sql-parser");
const node_crypto_1 = __importDefault(require("node:crypto"));
const fs = __importStar(require("node:fs"));
/**
 * Extracts a migration method body by matching its declaration and balancing braces.
 *
 * @param content - Migration file source text.
 * @param method - Migration method to extract.
 * @returns The method body, or an empty string when the method is not found.
 */
function getMethodBody(content, method) {
    // prettier-ignore
    const pattern = new RegExp(`(?:public\\s+|private\\s+|protected\\s+)?(?:async\\s+)?${method}\\s*\\([^)]*\\)\\s*(?::\\s*[^\\{]+)?\\{`);
    const match = pattern.exec(content);
    if (!match)
        return '';
    const start = match.index + match[0].length;
    let depth = 1;
    for (let i = start; i < content.length; i++) {
        const char = content[i];
        if (char === '{')
            depth += 1;
        if (char === '}')
            depth -= 1;
        if (depth === 0)
            return content.slice(start, i);
    }
    return '';
}
/**
 * Maps a TypeORM driver type to a `node-sql-parser` dialect name.
 *
 * @param type - TypeORM data source type (e.g. `postgres`, `mysql`).
 * @returns SQL parser dialect; defaults to `postgresql` when unknown.
 */
function getParserDialect(type) {
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
function sortObjectKeys(value) {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .reduce((a, b) => {
            a[b] = sortObjectKeys(value[b]);
            return a;
        }, {});
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
function normalizeSqlAst(sql, dialect) {
    try {
        const parser = new node_sql_parser_1.Parser();
        const ast = parser.astify(sql, { database: dialect });
        const normalized = sortObjectKeys(ast);
        return JSON.stringify(normalized);
    }
    catch (e) {
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
function getMigQueries(content) {
    // prettier-ignore
    const regex = new RegExp(/queryRunner\.query\(\s*`([\s\S]*?)`\s*(?:,\s*[\s\S]*?)?\)/g);
    const body = getMethodBody(content, 'up');
    const queries = [];
    for (const match of body.matchAll(regex)) {
        const sql = match[1];
        if (sql)
            queries.push(sql);
    }
    return queries;
}
/**
 * Builds normalized AST signatures for all `up` queries in a migration file.
 *
 * @param content - Migration file source text.
 * @param dialect - Parser dialect for the target database.
 * @returns Normalized AST strings in file order.
 */
function getMigAstSignatures(content, dialect) {
    const queries = getMigQueries(content);
    return queries.map((q) => normalizeSqlAst(q, dialect));
}
/**
 * Computes a SHA-256 hex digest of a string.
 *
 * @param value - Input to hash.
 * @returns Hex-encoded SHA-256 hash.
 */
function hash(value) {
    return node_crypto_1.default.createHash('sha256').update(value).digest('hex');
}
/**
 * Hashes each normalized `up` query and the sorted migration-level query set.
 *
 * @param content - Migration file source text.
 * @param dialect - Parser dialect for the target database.
 * @returns Query hashes plus a migration hash that is insensitive to query order.
 */
function getMigAstHashes(content, dialect) {
    const res = getMigAstSignatures(content, dialect);
    const hashes = res.map((r) => hash(r));
    const migHash = hash([...hashes].sort().join('\n'));
    return { migHash, hashes };
}
/**
 * Compares a generated migration against existing files by AST hash.
 * Returns the first existing migration whose `up` queries normalize to the same set.
 *
 * @param current - Source text of the newly generated migration.
 * @param existing - Local migration folders to compare against.
 * @param dialect - Parser dialect for the target database.
 * @returns Duplicate match with file path and hash, or `null` when unique.
 */
function compareMig(current, existing, dialect) {
    return __awaiter(this, void 0, void 0, function* () {
        const newHash = getMigAstHashes(current, dialect);
        for (const f of existing) {
            const existingContent = yield fs.promises.readFile(f.file, 'utf-8');
            const existingHash = getMigAstHashes(existingContent, dialect);
            if (existingHash.migHash === newHash.migHash) {
                return Object.assign({ file: f.file, name: f.name }, existingHash);
            }
        }
        return null;
    });
}
//# sourceMappingURL=compare-mig.js.map