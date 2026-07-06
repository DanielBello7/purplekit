# Purplekit

TypeORM database tooling with a small, opinionated CLI.

Purplekit gives TypeORM projects a predictable workflow for creating databases,
generating migrations, applying migrations, checking status, and running seeders.
It stores project artifacts under `purplekit/` so migration and seed files stay grouped
away from application code.

## Install

```bash
npm install purplekit typeorm reflect-metadata
```

Install the database driver your project needs, for example:

```bash
npm install pg
```

## Quick Start

```bash
npx purplekit init
```

This creates:

```text
purplekit/
  migrations/
  seeds/
  purplekit.config.ts
```

Edit `purplekit/purplekit.config.ts` with your TypeORM connection options, entities, and
seed classes.

## Commands

```bash
npx purplekit createdb
npx purplekit dropdb
npx purplekit status
npx purplekit gen --name CreateUsers
npx purplekit migrate
npx purplekit migration
npx purplekit seed
```

Useful options:

```bash
npx purplekit createdb --name app_dev
npx purplekit dropdb --name app_dev
npx purplekit status --name app_dev
npx purplekit gen --name CreateUsers --force
npx purplekit migrate --name CreateUsers1780000000000
npx purplekit migrate --file purplekit/migrations/CreateUsers1780000000000/migration.ts
npx purplekit seed --db app_dev
```

## Config

```ts
import type { PURPLEKIT_CONFIGURATIONS } from 'purplekit';

const config: PURPLEKIT_CONFIGURATIONS = {
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
import type { PURPLEKIT_CONFIGURATIONS } from 'purplekit';
import { seedEntities } from 'purplekit';
```

`seedEntities` is provided for building reusable seed classes.

## Documentation

The README is intentionally compact. Full guides, examples, and command details
belong in the docs web app.
