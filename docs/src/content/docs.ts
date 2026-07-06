export type NavItem = {
  to: string;
  label: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Start',
    description: 'Install, initialize, and configure TGX.',
  },
  {
    to: '/commands',
    label: 'Commands',
    description: 'Database, migration, status, and seed commands.',
  },
  {
    to: '/config',
    label: 'Config',
    description: 'The public configuration surface.',
  },
  {
    to: '/example',
    label: 'Example',
    description: 'Users, posts, comments, and seeders.',
  },
  {
    to: '/api',
    label: 'API',
    description: 'Public package exports.',
  },
];

export const commands = [
  ['init', 'Create the opinionated tgx folder, config, migrations, and seeds.'],
  ['createdb', 'Create the configured database if it does not already exist.'],
  ['dropdb', 'Drop the configured database.'],
  [
    'status',
    'Check database existence, table count, migration counts, and local duplicates.',
  ],
  [
    'gen',
    'Generate a migration under tgx/migrations/<NameTimestamp>/migration.ts.',
  ],
  [
    'migrate',
    'Run pending migration files, optionally scoped to a name or file.',
  ],
  ['migration', 'Generate a migration and immediately apply it.'],
  ['seed', 'Run configured typeorm-extension seed classes.'],
] as const;

export const shellCommands = `npm install tgx typeorm reflect-metadata
npm install pg

npx tgx init
npx tgx createdb
npx tgx gen --name CreateUsers
npx tgx migrate
npx tgx seed`;

export const configExample = `import type { TGX_CONFIGURATIONS } from 'tgx';
import { UserSeeder } from './seeds/users/users.seeder';
import { PostSeeder } from './seeds/posts/posts.seeder';
import { CommentSeeder } from './seeds/comments/comments.seeder';

const config: TGX_CONFIGURATIONS = {
  ENTITIES: ['src/**/*.schema.ts'],
  SEEDS: [UserSeeder, PostSeeder, CommentSeeder],

  TYPE: 'postgres',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 5432,
  DATABASE_USERNAME: 'postgres',
  DATABASE_PASSWORD: '',
  DATABASE_NAME: 'app',
  INITIAL_DATABASE: 'postgres',

  SSL_MODE: false,
  SSL_TYPE: 'light',
  DATABASE_CA_CERT: './',
  SYNCHRONIZE: false,
  LOGGING: false,
};

export default config;`;

export const seederExample = `import { User } from 'docs/src/schema/user.schema';
import { seedEntities } from 'tgx';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { userSeeds } from './users.seed';

class UserSeeder implements Seeder {
  run(ds: DataSource): Promise<void> {
    return seedEntities(ds, User, userSeeds, 'users');
  }
}

export { UserSeeder };`;

export const schemaExample = `@Entity('posts')
class Post implements IPost {
  @PrimaryColumn('uuid') id: string;
  @Column({ type: 'int' }) index: number;
  @Column({ type: 'varchar' }) body: string;
  @Column({ type: 'varchar' }) title: string;
  @Column({ type: 'uuid' }) createdBy: string;
  @CreateDateColumn({ type: 'timestamp' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' }) deletedAt: Date | undefined;
}`;

export const postSeedExample = `export const postSeeds: IPost[] = [
  {
    ...common(IDs.POSTS.USER_1_POST_1, 1),
    title: 'Designing a calmer product roadmap',
    createdBy: IDs.USERS.USER_1,
    body: 'A roadmap is most useful when it explains tradeoffs...'
  }
];`;

export const commandOptions = `npx tgx createdb --name app_dev
npx tgx status --name app_dev
npx tgx gen --name CreateUsers --force
npx tgx migrate --name CreateUsers1780000000000
npx tgx migrate --file tgx/migrations/CreateUsers1780000000000/migration.ts
npx tgx seed --db app_dev`;

export const apiExample = `import type { TGX_CONFIGURATIONS } from 'tgx';
import {
  createdb,
  dropdb,
  gen,
  init,
  migrate,
  migration,
  seed,
  seedEntities,
  status,
} from 'tgx';`;
