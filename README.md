# DaysNotWeeks

DaysNotWeeks is a focused Next.js SaaS foundation for individual-account subscription products.

The canonical product contract is [`docs/product/SCOPE.md`](docs/product/SCOPE.md). Historical contracts and executed prompts under `docs/archive/` are non-authoritative.

## Current repository state

The repository currently contains the permanent Scope 2.0 UI/design-system foundation plus real Supabase Auth, Postgres/RLS, generated database types, and the replaceable Example Resource.

Auth includes Google OAuth entry/callback, email/password signup and sign-in, email verification/resend, password recovery/reset, SSR cookie sessions, logout, protected `/app` routing, safe internal redirects, and Account display-name updates.

The database layer uses versioned SQL migrations, explicit grants, RLS, immutable ownership, a server-owned billing projection, a current-user `has_pro()` entitlement boundary, pgTAP coverage, and generated TypeScript database types. The Example Resource is persisted in Postgres and proves Auth → ownership → RLS → entitlement → CRUD: Free/revoked users retain read/delete access to owned resources, while current Pro entitlement is required for create/edit.

Stripe billing is implemented with server-selected Checkout, Customer Portal, signed webhooks, durable event/Checkout ledgers, paid-through entitlement projection, crash-recoverable event processing and a server-only reconciliation command. CI/release automation and final hosted release evidence remain deployment work. Hosted provider configuration must be verified for each deployed environment.

Do not infer implemented behavior from the product Scope; see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the current implementation boundary.

## Local start

Use the versions committed by the repository (`package.json`, lockfile and `.node-version`). At the current baseline this is Node 24 and pnpm 11.19.0. Docker must be running for the local Supabase stack.

```sh
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
```

Copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, use the local Supabase URL/publishable key printed by `pnpm supabase:status`, use the local service-role JWT for `SUPABASE_SECRET_KEY` when exercising billing writes, and set a local support email. Stripe billing additionally requires test-mode Stripe credentials and the configured monthly/annual Price IDs. Then:

```sh
pnpm dev
```

Local Auth email is captured by Mailpit at `http://127.0.0.1:54324`; no Resend account, DNS or public domain is required for local signup/confirmation/recovery testing.

Database verification uses the local Supabase/Postgres stack:

```sh
pnpm supabase:db:reset
pnpm supabase:test:db
pnpm supabase:types
```

`supabase:db:reset` is destructive to the local database and rebuilds it from committed migrations. `supabase:test:db` exercises ownership, RLS, immutable owner, anonymous denial, Free/Pro/revoked entitlement behavior, and retained read/delete semantics. `supabase:types` regenerates `lib/supabase/database.types.ts` as UTF-8.

Run the application checks separately:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Stop local Supabase with `pnpm supabase:stop`.

These local checks do not certify deployer-owned hosted Google OAuth, Resend SMTP, Stripe, or Vercel configuration.

## Provider ownership

The starter integrates with external providers but does not proxy or resell them. Each deployed product uses its own Supabase project, Resend account/sending domain and Stripe account. Provider credentials and DNS remain owned by the deployer and are never shared with DaysNotWeeks.

For Auth email, Supabase Auth sends through the deployer's Resend SMTP configuration. The Next.js application does not need Resend SDK credentials merely to deliver Supabase Auth email.

## Documentation

- [Product Scope](docs/product/SCOPE.md) — sole product authority.
- [Architecture](docs/ARCHITECTURE.md) — what the repository implements now and known gaps.
- [Setup](docs/SETUP.md) — current local/provider setup boundary.
- [Historical material](docs/archive/README.md) — traceability only.
