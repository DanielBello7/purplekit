import { Post } from 'docs/src/schema/post.schema';
import { seedEntities } from '@/libs/seed-entities';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { postSeeds } from './posts.seed';

class PostSeeder implements Seeder {
  run(ds: DataSource): Promise<any> {
    return seedEntities(ds, Post, postSeeds, 'posts');
  }
}

export { PostSeeder };
