# SISOL Construction — Quotes & Project Simulator

A Next.js (App Router) + Prisma + Neon PostgreSQL app for SISOL Construction Ltd.
Visitors create an account, run the **project quote simulator** to get a ballpark
construction estimate, and save quote versions to their dashboard.

## What's in the data model

Three core tables (see [`prisma/schema.prisma`](prisma/schema.prisma)):

| Table           | Purpose                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| `users`         | Built-in email + password auth (bcrypt hash, JWT session cookie).      |
| `simulations`   | A project quote / lead: contact + project details and a cost estimate. |
| `saved_results` | Saved **quote versions per user**, linked to a simulation.             |

Relationships: a `User` has many `simulations` and many `saved_results`; a
`Simulation` has many `saved_results` (versioned, `@@unique([simulationId, version])`).

## Tech

- **Next.js 15** (App Router, route handlers, middleware-guarded `/dashboard`)
- **Prisma 6** with the **Neon serverless driver adapter** (`@prisma/adapter-neon`) —
  works on Vercel's serverless/edge runtime over HTTPS/WebSocket.
- **Auth**: email + password, bcrypt hashing, JWT (`jose`) in an httpOnly cookie.
- **Validation**: `zod`.

## Local setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL and AUTH_SECRET
```

`.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
AUTH_SECRET="<openssl rand -base64 32>"
```

### Create the tables in Neon

Pick whichever fits your network:

1. **Standard Prisma** (needs direct Postgres / port 5432 access):
   ```bash
   npx prisma migrate deploy        # applies prisma/migrations/*
   # or, for a quick non-migration push:
   npx prisma db push
   ```

2. **Serverless apply** (when only HTTPS/WebSocket egress is allowed):
   ```bash
   npm run db:apply                 # runs scripts/apply-schema.mjs over the Neon driver
   ```

3. **Manual**: paste [`prisma/migrations/0001_init/migration.sql`](prisma/migrations/0001_init/migration.sql)
   into the Neon SQL Editor.

Optional demo data:

```bash
npm run db:seed                    # demo@sisolconstruction.co.uk / password123
```

### Run

```bash
npm run dev      # http://localhost:3000
```

## Deploying to Vercel

1. Import the repo into Vercel.
2. Set env vars **DATABASE_URL** and **AUTH_SECRET** in the Vercel project.
3. Build command is `prisma generate && next build` (already in `package.json`).
   The Neon serverless adapter needs no extra config on Vercel.

## API

All routes are under `/api`, return JSON, and (except auth) require a session cookie.

| Method   | Route                  | Description                                  |
| -------- | ---------------------- | -------------------------------------------- |
| `POST`   | `/api/auth/register`   | Create account, sets session cookie.         |
| `POST`   | `/api/auth/login`      | Sign in.                                     |
| `POST`   | `/api/auth/logout`     | Clear session.                               |
| `GET`    | `/api/auth/me`         | Current user.                                |
| `GET`    | `/api/simulations`     | List the user's quotes.                      |
| `POST`   | `/api/simulations`     | Create a quote; computes a ballpark estimate.|
| `GET`    | `/api/simulations/:id` | One quote with its saved versions.           |
| `PATCH`  | `/api/simulations/:id` | Update a quote (recomputes estimate).        |
| `DELETE` | `/api/simulations/:id` | Delete a quote.                              |
| `GET`    | `/api/results`         | List the user's saved quote versions.        |
| `POST`   | `/api/results`         | Save a new quote version (auto-increments).  |
| `GET`    | `/api/results/:id`     | One saved version.                           |
| `PATCH`  | `/api/results/:id`     | Update a saved version.                       |
| `DELETE` | `/api/results/:id`     | Delete a saved version.                       |

## Notes

- The cost simulator ([`src/lib/simulator.ts`](src/lib/simulator.ts)) uses indicative
  London £/m² rates by project type and finish level — tune to your real pricing.
- Never commit `.env`; only `.env.example` is tracked.
