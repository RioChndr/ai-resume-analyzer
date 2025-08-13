# Copilot Coding Agent Instructions for contango-test

## Project Overview

- **Stack:** Next.js (App Router), tRPC, Prisma (PostgreSQL), NextAuth.js, Tailwind CSS, React Query, Zod, Radix UI
- **Purpose:** Full-stack web app scaffolded with T3 Stack, featuring authentication, API routing, and database integration.

## Architecture & Data Flow

- **API Layer:**
  - tRPC routers in `src/server/api/routers/` (e.g., `post.ts`) define backend procedures (queries/mutations).
  - All routers are registered in `src/server/api/root.ts` as `appRouter`.
  - API endpoints are exposed via `src/app/api/trpc/[trpc]/route.ts` using `fetchRequestHandler`.
- **Database:**
  - Prisma models in `prisma/schema.prisma` (User, Post, Account, Session, VerificationToken).
  - DB access via `ctx.db` in tRPC procedures; user context via `ctx.session.user`.
- **Auth:**
  - NextAuth.js with Prisma adapter; session available in tRPC context.
- **Frontend:**
  - UI components in `src/components/ui/`.
  - Pages in `src/app/` (App Router).
  - React Query for client-side data fetching.

## Developer Workflows

- **Start Dev Server:** `pnpm dev`
- **Build:** `pnpm build`
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint` or `pnpm lint:fix`
- **Format:** `pnpm format:check` / `pnpm format:write`
- **Prisma Migrations:**
  - Dev: `pnpm db:generate`
  - Deploy: `pnpm db:migrate`
  - Push: `pnpm db:push`
  - Studio: `pnpm db:studio`
- **Database:**
  - Local Postgres expected; start with `start-database.sh` or Docker (`contango-test-postgres`).

## Conventions & Patterns

- **tRPC Procedures:**
  - Use `publicProcedure` for unauthenticated, `protectedProcedure` for authenticated endpoints.
  - Context (`ctx`) provides `db` and `session`.
  - Zod for input validation.
- **Environment Variables:**
  - Defined/validated in `src/env.js` using `@t3-oss/env-nextjs` and Zod.
  - Server-side: `DATABASE_URL`, `AUTH_SECRET`, etc.
- **File Structure:**
  - API logic: `src/server/api/routers/`
  - DB models: `prisma/schema.prisma`
  - UI: `src/components/ui/`
  - Pages: `src/app/`
- **Styling:**
  - Tailwind CSS, with Prettier plugin for formatting.
- **Type Safety:**
  - Zod for runtime validation, TypeScript throughout.

## Integration Points

- **Auth:** NextAuth.js (see `src/server/auth/`)
- **DB:** Prisma (see `src/server/db.ts`)
- **API:** tRPC (see `src/server/api/`)

## Examples

- **Add a tRPC endpoint:**
  - Create in `src/server/api/routers/yourRouter.ts`, register in `root.ts`.
- **Access DB in tRPC:**
  - `ctx.db.model.method()` (e.g., `ctx.db.post.create`)
- **Require Auth in tRPC:**
  - Use `protectedProcedure`.

---

For questions or unclear conventions, check `README.md` or ask for clarification.
