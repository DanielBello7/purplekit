import { describe, it } from 'mocha';

describe('createdb feature', () => {
  describe('create', () => {
    it('connects through the initial/admin database');
    it(
      'checks whether the requested database already exists before creating it',
    );
    it('creates the database when it does not already exist');
    it('returns already-exists when the database is present');
    it('destroys the datasource after a successful create check');
    it('destroys the datasource after a failed create attempt');
    it(
      'throws a serialized error when the database check or create query fails',
    );
  });

  describe('createdb cli handler', () => {
    it('uses the configured database name when --name is not provided');
    it('sanitizes the requested database name before creating it');
    it('prints a created message when a database is created');
    it('prints an already-exists message when no create is needed');
    it('prints an error and exits with code 1 when create fails');
  });
});
