# Purplekit Docs

This is the documentation web app for Purplekit. It is a separate Vite app inside the
main repository so the package README can stay compact while the full guides,
examples, and command references live here.

## Stack

- Vite
- React
- React Router
- Tailwind CSS

## Run Locally

From the repository root:

```bash
corepack pnpm --filter docs dev
```

Or from this folder:

```bash
pnpm dev
```

## Build

```bash
corepack pnpm --filter docs build
```

## Structure

```text
src/
  components/   Shared documentation UI
  content/      Static docs content and code examples
  pages/        Route-level pages
  routes/       React Router route definitions
```

## Example Source

The `docs/.hide` folder contains a small Purplekit example project. The docs use it as
the source of truth for realistic schema and seeding examples, including users,
posts, comments, and `seedEntities` usage.

## Publishing

The docs app is not included in the Purplekit npm package. It should be built and
deployed separately as the public documentation site.
