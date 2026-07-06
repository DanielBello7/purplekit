import { Comment } from 'docs/src/schema/comment.schema';
import { seedEntities } from '@/libs/seed-entities';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { commentSeeds } from './comments.seed';

class CommentSeeder implements Seeder {
  run(ds: DataSource): Promise<void> {
    return seedEntities(ds, Comment, commentSeeds, 'comments');
  }
}

export { CommentSeeder };
