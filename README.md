# DaysNotWeeks

DaysNotWeeks is a focused Next.js SaaS foundation for individual-account subscription products.

The canonical product contract is [`docs/product/SCOPE.md`](docs/product/SCOPE.md). Historical contracts and executed prompts under `docs/archive/` are non-authoritative.

## Current repository state

The repository currently contains the permanent Scope 2.0 UI/design-system foundation plus real Supabase Auth integration: Google OAuth entry/callback, email/password signup and sign-in, email verification/resend surfaces, password recovery/reset, SSR cookie sessions, logout, protected `/app` routing, safe internal redirects, and Account display-name updates.

Hosted provider configuration is still required for Google OAuth and Auth email delivery. Database schema/RLS, real Example persistence/entitlements, Stripe billing, CI/release automation, and final hosted release evidence are not yet complete.

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

These local checks do not certify hosted Google OAuth, customer-owned Resend SMTP, real RLS, Stripe, or Vercel behavior.

## Provider ownership

The starter integrates with external providers but does not proxy or resell them. Each deployed product uses its own Supabase project, Resend account/sending domain and Stripe account. Provider credentials and DNS remain owned by the deployer and are never shared with DaysNotWeeks.

For Auth email, Supabase Auth sends through the deployer's Resend SMTP configuration. The Next.js application does not need Resend SDK credentials merely to deliver Supabase Auth email.

## Documentation

- [Product Scope](docs/product/SCOPE.md) — sole product authority.
- [Architecture](docs/ARCHITECTURE.md) — what the repository implements now and known gaps.
- [Setup](docs/SETUP.md) — current local/provider setup boundary.
- [Historical material](docs/archive/README.md) — traceability only.
