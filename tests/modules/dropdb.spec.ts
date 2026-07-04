import { describe, it } from 'mocha';

describe('dropdb feature', () => {
  describe('drop', () => {
    it('connects through the initial/admin database');
    it('runs the dialect-specific drop database command');
    it('returns dropped true after a successful drop');
    it('destroys the datasource after a successful drop');
    it('destroys the datasource after a failed drop');
    it('throws a serialized error when the drop query fails');
  });

  describe('dropdb cli handler', () => {
    it('uses the configured database name when --name is not provided');
    it('sanitizes the requested database name before dropping it');
    it('prints a success message when the database is dropped');
    it('prints an error and exits with code 1 when drop fails');
  });
});
