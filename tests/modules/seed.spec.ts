import { describe, it } from 'mocha';

describe('seed feature', () => {
  it('connects to the configured target database');
  it('runs configured seed operations in order');
  it('prints a success message when seeding completes');
  it('destroys the datasource after successful seeding');
  it('destroys the datasource when seeding fails');
  it('prints an error and exits with code 1 when seeding fails');
});
