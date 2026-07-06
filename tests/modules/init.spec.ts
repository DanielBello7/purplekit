import { strict as assert } from 'node:assert';
import { init } from '@/features/init';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

describe('init feature', () => {
  let cwd: string;
  let root: string;
  let originalLog: typeof console.log;

  async function silenceLogs<T>(task: () => Promise<T>) {
    const previous = console.log;
    console.log = () => undefined;
    try {
      return await task();
    } finally {
      console.log = previous;
    }
  }

  beforeEach(async () => {
    cwd = process.cwd();
    originalLog = console.log;
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'tgx-init-'));
    process.chdir(root);
  });

  afterEach(async () => {
    console.log = originalLog;
    process.chdir(cwd);
    await fs.rm(root, { recursive: true, force: true });
  });

  it('prints initialization messages', async () => {
    const original = console.log;
    const logs: string[] = [];
    console.log = (value: string) => {
      logs.push(value);
    };

    try {
      await init();
    } finally {
      console.log = original;
    }

    assert.equal(logs.length, 2);
    assert.match(logs[0] ?? '', /initializing app/);
    assert.match(logs[1] ?? '', /initialized/);
  });

  it('creates the default configuration file inside the tgx folder', async () => {
    await silenceLogs(init);

    const content = await fs.readFile('tgx/tgx.config.ts', 'utf-8');
    assert.match(content, /TGX_CONFIGURATIONS/);
    assert.match(content, /SEEDS: \[\]/);
  });

  it('does not overwrite an existing configuration file', async () => {
    await fs.mkdir('tgx', { recursive: true });
    await fs.writeFile('tgx/tgx.config.ts', 'const custom = true;\n');

    await silenceLogs(init);

    assert.equal(
      await fs.readFile('tgx/tgx.config.ts', 'utf-8'),
      'const custom = true;\n',
    );
  });

  it('creates the opinionated tgx directories', async () => {
    await silenceLogs(init);

    assert.equal((await fs.stat('tgx')).isDirectory(), true);
    assert.equal((await fs.stat('tgx/migrations')).isDirectory(), true);
    assert.equal((await fs.stat('tgx/seeds')).isDirectory(), true);
  });

  it('creates placeholder files required for empty tgx folders', async () => {
    await silenceLogs(init);

    await fs.access('tgx/.gitkeep');
    await fs.access('tgx/migrations/.gitkeep');
    await fs.access('tgx/seeds/.gitkeep');
  });
});
