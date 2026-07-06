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
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'purplekit-init-'));
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

  it('creates the default configuration file inside the purplekit folder', async () => {
    await silenceLogs(init);

    const content = await fs.readFile('purplekit/purplekit.config.ts', 'utf-8');
    assert.match(content, /PURPLEKIT_CONFIGURATIONS/);
    assert.match(content, /SEEDS: \[\]/);
  });

  it('does not overwrite an existing configuration file', async () => {
    await fs.mkdir('purplekit', { recursive: true });
    await fs.writeFile('purplekit/purplekit.config.ts', 'const custom = true;\n');

    await silenceLogs(init);

    assert.equal(
      await fs.readFile('purplekit/purplekit.config.ts', 'utf-8'),
      'const custom = true;\n',
    );
  });

  it('creates the opinionated purplekit directories', async () => {
    await silenceLogs(init);

    assert.equal((await fs.stat('purplekit')).isDirectory(), true);
    assert.equal((await fs.stat('purplekit/migrations')).isDirectory(), true);
    assert.equal((await fs.stat('purplekit/seeds')).isDirectory(), true);
  });

  it('creates placeholder files required for empty purplekit folders', async () => {
    await silenceLogs(init);

    await fs.access('purplekit/.gitkeep');
    await fs.access('purplekit/migrations/.gitkeep');
    await fs.access('purplekit/seeds/.gitkeep');
  });
});
