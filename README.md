# Supabase SaaS Starter

**Production-ready SaaS starter built with Next.js, Supabase, Stripe and Vercel.**

[Live demo](https://supasaas-kit.vercel.app) · [Setup](docs/SETUP.md) · [Architecture](docs/ARCHITECTURE.md) · [Billing runbook](docs/runbooks/BILLING.md)

[![CI](https://github.com/pablocampelo/supabase-saas-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/pablocampelo/supabase-saas-starter/actions/workflows/ci.yml)

[![SupaSaaS landing preview](public/landing.png)](https://supasaas-kit.vercel.app)

Supabase SaaS Starter gives technical founders and small teams a focused subscription foundation instead of another oversized boilerplate. Authentication, private user data, paid access, billing recovery and the deployment path are connected and tested.

Built for **individual user accounts**, **Free + Pro**, and **monthly or annual billing**. The repository deliberately stays narrow: no teams, seats, usage billing, CMS, analytics framework or speculative provider abstraction.

## Why this starter

- **Security boundaries are explicit.** Supabase Auth, Postgres ownership and RLS are exercised together instead of relying on client-side checks.
- **Billing is server-authoritative.** Stripe Checkout and Customer Portal are backed by signed webhooks, idempotent event handling and paid-through entitlement state. A browser return never grants Pro.
- **The sample domain is replaceable.** The Example Resource proves Auth → ownership → RLS → Pro → CRUD end to end without becoming architecture you have to keep.
- **The supported path is tested.** CI covers frozen install, lint, typecheck, unit tests, production build, Supabase migrations, database security tests, generated types and Playwright E2E.

## What's included

| Foundation | What ships |
| --- | --- |
| **Next.js** | App Router, strict TypeScript, responsive marketing/auth/app surfaces and Vercel deployment |
| **Supabase** | Google + email/password Auth, Postgres, migrations, generated types, ownership constraints and RLS |
| **Stripe** | Free + Pro, monthly/annual Checkout, Customer Portal, signed webhooks and paid-through access |
| **Product flows** | Signup, verification, login, recovery, Dashboard, Account, Billing, Help and legal templates |
| **Reliability** | Idempotent billing processing, concurrency protection, diagnostics and dry-run reconciliation |
| **Confidence** | GitHub Actions, unit tests, database tests and browser E2E |

## Run it locally

**Prerequisites:** Node.js 24, pnpm 11.19.0 and Docker.

```sh
git clone https://github.com/pablocampelo/supabase-saas-starter.git my-saas
cd my-saas
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
```

Copy `.env.example` to `.env.local`. Use the local Supabase URL and publishable key printed by `pnpm supabase:status`, keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, and provide a support email. For local billing writes, use the **local service-role key** as `SUPABASE_SECRET_KEY`. Never expose it through a `NEXT_PUBLIC_*` variable.

```sh
pnpm supabase:db:reset
pnpm dev
```

Open **http://localhost:3000**. Local signup and password recovery use Mailpit at **http://127.0.0.1:54324**, so you can exercise email flows without a real inbox.

To exercise real Checkout and Pro, add Stripe **test-mode** credentials and the supported monthly/annual Price IDs, then run a local Stripe webhook listener. See [Setup](docs/SETUP.md) for the complete provider and deployment path.

## Make it yours

1. **Brand it.** Edit `config/product.ts`, replace the sample marketing/legal copy and point the canonical site URL at your deployment.
2. **Own the providers.** Create your Supabase project, Google OAuth credentials, SMTP sender and Stripe products/Prices.
3. **Replace Example.** Build your real domain in place of `lib/example/` and the Example routes. Add migrations and regenerate database types while preserving Auth, Billing and RLS trust boundaries.
4. **Deploy.** Apply hosted migrations deliberately, deploy to Vercel, configure the signed Stripe webhook and verify Auth, recovery and paid access on the hosted environment.

## Verify changes

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm supabase:db:reset
pnpm supabase:test:db
pnpm supabase:types
pnpm exec playwright install chromium
pnpm test:e2e
```

The database reset is **destructive to your local Supabase database**. Never point it at hosted data. CI validates the repository; hosted credentials, redirects, SMTP and webhook destinations still need environment-level verification.

## Scope

The starter intentionally supports **one user-owned data model, one Pro entitlement, two billing intervals and Vercel as the deployment target**. It does not include teams/seats, extra OAuth providers, usage billing, queues, CMS, analytics, a generic API, automatic billing-repair cron or an admin panel.

This constraint is intentional: the infrastructure stays understandable while the replaceable product domain stays yours.

## Documentation

- [Setup](docs/SETUP.md) — local development, hosted Supabase/Auth/SMTP, Stripe and Vercel
- [Architecture](docs/ARCHITECTURE.md) — boundaries, code map and replacing Example
- [Billing runbook](docs/runbooks/BILLING.md) — payment recovery and safe reconciliation
- [Product Scope 2.0](docs/product/SCOPE.md) — canonical supported feature contract
- [Release notes](docs/release/v0.1.0.md) — versioned release and verification evidence
- [AGENTS.md](AGENTS.md) — concise rules for developers and coding agents
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution workflow and scope expectations
- [SECURITY.md](SECURITY.md) — responsible vulnerability reporting

## License

[MIT](LICENSE)
