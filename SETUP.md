# Development setup

This project uses Next.js App Router, React, TypeScript, Tailwind CSS,
ESLint, Prettier, and Prisma with PostgreSQL.

## Start the app

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000.

## Local PostgreSQL

Install Docker Desktop with Docker Compose, then run:

```powershell
npm.cmd run db:up
npm.cmd run db:check
```

The generated `.env` uses local development credentials. For a hosted database,
set `DATABASE_URL` to its PostgreSQL connection string instead.
Keep `.env` private; commit only `.env.example`.

The Prisma schema intentionally starts without application models. Add models
in `prisma/schema.prisma`, then run `npm.cmd run db:migrate -- --name init`.
Use `npm.cmd run db:generate` after schema changes and `npm.cmd run db:studio`
to browse the database. Run `npm.cmd run db:deploy` to apply committed migrations
in deployment.

## Quality checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
```

Zod and React Hook Form with Zod resolvers support validation and forms.
Use `cn` from `@/lib/utils` to combine Tailwind classes.
Use `prisma` from `@/lib/prisma` only in server code.

Your original project rules remain in README.md. Shared styles and theme tokens
live in `src/styles/global.css`.
