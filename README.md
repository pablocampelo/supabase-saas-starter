# DaysNotWeeks

**The SaaS foundation you can replace the example in—not rebuild around.**

DaysNotWeeks is a focused, cloneable **Next.js + Supabase + Stripe** starter for technical founders and small teams building a subscription SaaS. Authentication, private user data, paid access and billing recovery are connected and tested. You own the code, providers and deployment.

Built for **individual user accounts**, **Free + Pro**, and **monthly or annual billing**. Not a team/organization platform or a multi-provider framework.

## What's included

| Foundation | What you get |
| --- | --- |
| **Auth** | Google and email/password signup, verification, login, recovery, logout and server-side sessions |
| **Private data** | Supabase Postgres, versioned SQL migrations, generated types, ownership constraints and RLS |
| **Subscriptions** | Stripe Checkout for Pro monthly/annual, Customer Portal, signed webhooks and paid-through entitlement |
| **Reliability** | Idempotent billing event handling, concurrency protections, diagnostics and dry-run reconciliation |
| **App** | Public landing/pricing/Help, Dashboard, Account, Billing, legal templates and one replaceable Example Resource |
| **Confidence** | Frozen dependency versions, GitHub Actions, database security tests, unit tests and browser E2E |

The **Example Resource** is intentionally small. It proves that Auth → ownership → RLS → Pro → CRUD works end to end; it is **not** something you must keep in your product.

## Run it locally

**Prerequisites:** Node.js 24, pnpm 11.19.0 and Docker. Use the pinned versions and lockfile.

```sh
git clone <your-repository-url> my-saas
cd my-saas
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
```

Copy `.env.example` to `.env.local`. Set the local Supabase URL and publishable key printed by `pnpm supabase:status`, keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, and provide a support email. For local billing writes, use the **local service-role key** as `SUPABASE_SECRET_KEY`. Never put it in a `NEXT_PUBLIC_*` variable.

```sh
pnpm supabase:db:reset
pnpm dev
```

Open **http://localhost:3000**. Local signup and password recovery use Mailpit at **http://127.0.0.1:54324**—no real email account is required to explore the foundation.

To exercise real Checkout and Pro, configure **Stripe test-mode** credentials and the two supported Price IDs in `.env.local`, then run a local Stripe webhook listener. The exact steps are in [Setup](docs/SETUP.md).

## Turn the starter into your product

1. **Brand it:** edit `config/product.ts` for product name, navigation, positioning, currency and supported plan copy. Replace the sample marketing and legal content before publishing.
2. **Own the providers:** create your own Supabase project, Google OAuth credentials, verified SMTP sender and Stripe products/Prices. Use environment-specific secrets and one canonical deployment URL. [Setup](docs/SETUP.md) walks through the supported path.
3. **Replace Example:** build your own domain in place of `lib/example/`, the Example routes and related presentation. Add a SQL migration and regenerate DB types. Keep the existing Auth, Billing and RLS trust boundaries. See [Architecture](docs/ARCHITECTURE.md#replacing-the-example-resource).
4. **Deploy:** apply hosted migrations deliberately, deploy to **Vercel**, configure Stripe's signed webhook and verify Auth, paid access and recovery on your own domain.

**You are not deploying a DaysNotWeeks-hosted service.** This repository becomes your SaaS, with your own data, accounts, billing and infrastructure.

## Check your changes

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

GitHub Actions runs the release-critical checks automatically. The database reset is **destructive to your local Supabase database**. Do not point it at hosted data. CI and a local build do not replace hosted provider verification.

## Know the boundaries

DaysNotWeeks deliberately has **one user-owned data model, one Pro entitlement, two billing intervals and one supported deployment target**. It does not include teams/seats, extra OAuth providers, usage billing, queues, a CMS, analytics, a generic API, automatic billing-repair cron or an admin panel.

**A browser returning from Checkout never grants Pro.** Access comes from verified Stripe payment facts projected into a server-owned paid-through state. If webhook retries are exhausted, the [Billing runbook](docs/runbooks/BILLING.md) documents the manual reconciliation path; no automatic recovery SLA is promised.

## Documentation

- [Setup](docs/SETUP.md) — local development, hosted Supabase/Auth/SMTP, Stripe and Vercel.
- [Architecture](docs/ARCHITECTURE.md) — boundaries, code map and replacing Example.
- [Billing runbook](docs/runbooks/BILLING.md) — payment recovery and safe reconciliation.
- [Product Scope 2.0](docs/product/SCOPE.md) — the canonical supported feature contract.
- [Release notes](docs/release/v0.1.0.md) — versioned release and verification evidence.
- [AGENTS.md](AGENTS.md) — concise rules for developers and coding agents.

**Distribution:** the versioned Git repository is the product. Any ZIP is only a snapshot of a tagged commit.
