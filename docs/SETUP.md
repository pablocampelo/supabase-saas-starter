# Current setup

`docs/product/SCOPE.md` defines the final supported product. This document describes the setup required by the repository as it exists now and calls out provider setup that remains to be implemented.

## Local foundation

1. Use the Node and pnpm versions committed by the repository. The current baseline is Node 24.x and pnpm 11.19.0.
2. Run `pnpm install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local`.
4. Set the current required values:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPPORT_EMAIL`
5. Run `pnpm dev`.
6. Run the current local checks:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser smoke harness uses synthetic public configuration and does not certify real Supabase Auth, Stripe, SMTP or Vercel behavior.

## Safe local build fixture

For a build-only check without remote provider setup, the existing tests/docs may use synthetic values such as:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_test_fixture
SUPPORT_EMAIL=support@example.com
```

Synthetic values are not operational credentials. A successful local build is not release evidence for external providers.

## Environment rules

- Browser-visible variables must use only publishable/public values.
- Secrets never belong in `NEXT_PUBLIC_*` variables.
- Hosted URLs require HTTPS; loopback HTTP is allowed for local development.
- Staging/test and production/live provider credentials must remain separate.
- Missing or invalid required configuration must fail safely without printing supplied secret values.

## Current billing-config gap

`.env.example` currently contains `PRO_MONTHLY_AMOUNT` and `PRO_ANNUAL_AMOUNT` from the Phase 0 catalog foundation. They are not the final Scope 2.0 authority for price amounts.

When billing is implemented, Stripe Price must become authoritative for amount, currency and recurrence, while configured Price IDs identify the supported monthly/annual options. Do not extend new behavior around the legacy amount variables.

## Hosted Auth setup — required by Scope 2.0, not implemented yet

The supported authentication methods are exactly:

- Google OAuth;
- email/password with verification and recovery.

Magic-link authentication is OUT.

The eventual hosted setup must document and verify:

- Supabase Auth callback/redirect allowlists;
- Google project/consent/callback configuration per environment;
- email confirmation and password recovery;
- Resend SMTP configured in Supabase with a verified sender/domain;
- session refresh and protected-route behavior;
- supported same-email behavior without custom account merging.

SMTP credentials belong in Supabase/provider configuration, not the Next.js browser bundle. The application does not need the Resend SDK merely to support Auth email.

## Database setup — required by Scope 2.0, not implemented yet

The final product must use versioned SQL migrations as schema authority, generated TypeScript database types, explicit grants and RLS. Local/CI verification must exercise A/B/anonymous and Free/Pro/revoked behavior against a real Supabase/Postgres test environment.

Do not invent DB types before the migrations exist.

## Stripe setup — required by Scope 2.0, not implemented yet

The final supported billing path is Stripe Checkout + Customer Portal + signed webhooks + a local reconstructible Pro projection.

Staging/test and production/live must be configured separately. The implementation must verify the configured monthly/annual Price IDs server-side, derive monetary facts from Stripe, and never grant Pro from the browser success redirect.

Billing setup is incomplete until webhook behavior, paid-through semantics, durable Checkout attempts, concurrency handling and reconciliation are implemented and tested.

## Deployment

Vercel is the only supported deployment target.

The final release path must keep local, staging and production isolated; apply database migrations through a controlled process rather than every preview deploy; and verify hosted Google OAuth, SMTP, Stripe webhook behavior and the deployed SHA before release.

Until those flows exist, do not describe the current Phase 0 foundation as a production-ready deployment.
