# DaysNotWeeks

DaysNotWeeks is a focused Next.js SaaS foundation for individual-account subscription products.

The canonical product contract is [`docs/product/SCOPE.md`](docs/product/SCOPE.md). Historical contracts and executed prompts under `docs/archive/` are non-authoritative.

## Current repository state

The repository currently contains the Phase 0 foundation only: App Router, strict TypeScript, Tailwind, product/env/catalog foundations, unprivileged Supabase clients, and local unit/browser verification. Auth flows, database schema/RLS, billing, Dashboard/Example, Account/Help, CI, hosted verification, and billing recovery are not yet implemented.

Do not infer implemented behavior from the product Scope; see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the current implementation boundary.

## Local start

Use the versions committed by the repository (`package.json`, lockfile and `.node-version`). At the current baseline this is Node 24 and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local`, provide the current required public Supabase configuration and support email, then:

```sh
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

These local checks do not certify hosted Google OAuth, Resend SMTP, real RLS, Stripe, or Vercel behavior.

## Documentation

- [Product Scope](docs/product/SCOPE.md) — sole product authority.
- [Architecture](docs/ARCHITECTURE.md) — what the repository implements now and known gaps.
- [Setup](docs/SETUP.md) — current local/provider setup boundary.
- [Historical material](docs/archive/README.md) — traceability only.
