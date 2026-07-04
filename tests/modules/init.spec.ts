import { strict as assert } from 'node:assert';
import { init } from '@/db/features/init';

describe('init feature', () => {
  it('prints an initialization message', () => {
    const original = console.log;
    const logs: string[] = [];
    console.log = (value: string) => {
      logs.push(value);
    };

    try {
      init();
    } finally {
      console.log = original;
    }

    assert.equal(logs.length, 1);
    assert.match(logs[0] ?? '', /initializing app/);
  });

  it('creates the default configuration file when missing');
  it('does not overwrite an existing configuration file without confirmation');
  it('creates the migrations directory when missing');
  it('creates placeholder files required for empty migration folders');
  it('prints an error and exits with code 1 when initialization fails');
});
