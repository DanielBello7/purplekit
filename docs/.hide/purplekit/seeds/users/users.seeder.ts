import { User } from 'docs/src/schema/user.schema';
import { seedEntities } from '@/libs/seed-entities';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { userSeeds } from './users.seed';

class UserSeeder implements Seeder {
  run(ds: DataSource): Promise<void> {
    return seedEntities(ds, User, userSeeds, 'users');
  }
}

export { UserSeeder };
