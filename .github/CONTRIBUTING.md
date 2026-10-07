# Contributing

Keep changes focused on the supported starter: Next.js, Supabase Auth/Postgres/RLS, Stripe subscriptions and Vercel.

Before requesting review:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm supabase:db:reset
pnpm supabase:test:db
pnpm supabase:types
pnpm test:e2e
```

Preserve the Auth, ownership, RLS and billing trust boundaries. Do not commit secrets or customer data. Update [Setup](../docs/SETUP.md), [Architecture](../docs/ARCHITECTURE.md) or [Billing](../docs/BILLING.md) only when the supported path changes.
