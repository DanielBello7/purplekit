import { sanitize } from '@/libs/sanitize';
import { describe, it } from 'mocha';
import { assert } from 'chai';

describe('sanitize library', () => {
  it('allows alphanumeric names', () => {
    assert.equal(sanitize('Db123'), 'Db123');
  });

  it('allows underscores', () => {
    assert.equal(sanitize('my_database_1'), 'my_database_1');
  });

  it('rejects names containing dashes', () => {
    assert.throws(() => sanitize('my-database'), /Only numbers/);
  });

  it('rejects names containing dots', () => {
    assert.throws(() => sanitize('my.database'), /Only numbers/);
  });

  it('rejects names containing whitespace', () => {
    assert.throws(() => sanitize('my database'), /Only numbers/);
  });

  it('rejects names containing SQL punctuation', () => {
    assert.throws(() => sanitize('users;drop'), /Only numbers/);
  });
});
