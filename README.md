# Lynq

Multi-tenant laundry & dry-cleaning management platform for Nigeria. Built as a Turborepo monorepo with a NestJS API, a Next.js web app (staff dashboard, owner analytics, customer booking), shared TypeScript packages, and a Postgres database with row-level security for tenant isolation.

## Stack

- **Monorepo**: pnpm + Turborepo
- **Backend**: NestJS, PostgreSQL (Prisma), Redis (BullMQ), Socket.io
- **Frontend**: Next.js 14 App Router with route groups for `(marketing)` / `(staff)` / `(admin)`
- **Auth**: Supabase Auth (phone OTP for customers, email for staff/owners)
- **Payments**: Paystack (primary), Flutterwave (fallback)
- **Messaging**: WhatsApp Cloud API + Termii SMS
- **Storage**: Cloudflare R2 (S3-compatible)

## Repository layout

```
lynq/
├── apps/
│   ├── api/         NestJS API
│   └── web/         Next.js web app (marketing + staff + admin)
├── packages/
│   ├── db/          Prisma schema, migrations, RLS policies
│   └── types/       Shared DTOs and the order state machine
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js >= 20 (tested on 22)
- pnpm 9 (`npm install -g pnpm@9`)
- Docker (for local Postgres + Redis), or hosted equivalents

## Getting started

```powershell
# 1. Install dependencies
pnpm install

# 2. Bring up Postgres + Redis (Docker)
docker run --name lynq-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
docker run --name lynq-redis -p 6379:6379 -d redis:7

# 3. Configure environment
Copy-Item .env.example .env

# 4. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start everything in dev mode
pnpm dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:3000`.

## Useful commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start all apps in watch mode         |
| `pnpm build`         | Build every package and app          |
| `pnpm typecheck`     | Run `tsc --noEmit` across the repo   |
| `pnpm lint`          | Lint every package and app           |
| `pnpm test`          | Run all unit and integration tests   |
| `pnpm db:generate`   | Generate the Prisma client           |
| `pnpm db:migrate`    | Apply Prisma migrations              |
| `pnpm db:studio`     | Open Prisma Studio                   |
