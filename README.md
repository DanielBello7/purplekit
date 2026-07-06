# TGX

TypeORM database tooling with a small, opinionated CLI.

TGX gives TypeORM projects a predictable workflow for creating databases,
generating migrations, applying migrations, checking status, and running seeders.
It stores project artifacts under `tgx/` so migration and seed files stay grouped
away from application code.

## Install

```bash
npm install tgx typeorm reflect-metadata
```

Install the database driver your project needs, for example:

```bash
npm install pg
```

## Quick Start

```bash
npx tgx init
```

This creates:

```text
tgx/
  migrations/
  seeds/
  tgx.config.ts
```

Edit `tgx/tgx.config.ts` with your TypeORM connection options, entities, and
seed classes.

## Commands

```bash
npx tgx createdb
npx tgx dropdb
npx tgx status
npx tgx gen --name CreateUsers
npx tgx migrate
npx tgx migration
npx tgx seed
```

Useful options:

```bash
npx tgx createdb --name app_dev
npx tgx dropdb --name app_dev
npx tgx status --name app_dev
npx tgx gen --name CreateUsers --force
npx tgx migrate --name CreateUsers1780000000000
npx tgx migrate --file tgx/migrations/CreateUsers1780000000000/migration.ts
npx tgx seed --db app_dev
```

## Config

```ts
import type { TGX_CONFIGURATIONS } from 'tgx';

const config: TGX_CONFIGURATIONS = {
  ENTITIES: ['src/**/*.schema.ts'],
  SEEDS: [],

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

export default config;
```

## Public API

```ts
import type { TGX_CONFIGURATIONS } from 'tgx';
import { seedEntities } from 'tgx';
```

`seedEntities` is provided for building reusable seed classes.

## Documentation

The README is intentionally compact. Full guides, examples, and command details
belong in the docs web app.
