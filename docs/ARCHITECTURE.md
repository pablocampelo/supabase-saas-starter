# Current architecture

`docs/product/SCOPE.md` is the sole product contract. This document describes the repository as it exists now; it does not claim that the full Scope 2.0 product is already implemented.

## Implemented foundation

| Location | Current responsibility |
| --- | --- |
| `app/layout.tsx`, `app/globals.css` | App Router root, local fonts and the permanent semantic light-theme design system |
| `app/(marketing)/`, `components/marketing/` | Public landing, pricing, FAQ, Help and legal-template surfaces |
| `app/(auth)/`, `components/auth/` | Google + email/password Auth UI, verification/recovery surfaces and E2E-only deterministic presentation adapter |
| `app/auth/` | Google OAuth start/callback and email/recovery PKCE token exchange |
| `proxy.ts`, `lib/supabase/proxy.ts` | Request-scoped session refresh and `/app` protection using validated Supabase claims |
| `app/app/`, `components/app/` | Permanent private app shell, Dashboard, Account, Billing and replaceable Example UI surfaces |
| `lib/example/` | Real Example Resource reads, Server Actions, validation and action state |
| `supabase/migrations/` | SQL schema authority for the billing projection, entitlement boundary and Example Resource |
| `supabase/tests/database/` | Real Postgres/RLS tests for A/B/anonymous and Free/Pro/revoked behavior |
| `lib/supabase/database.types.ts` | Generated TypeScript representation of the local database schema |
| `components/ui/`, `components/shared/` | Small owned primitive/pattern layer used by public, Auth and private surfaces |
| `config/product.ts`, `config/site.ts`, `config/metadata.ts` | Product identity, navigation, environment-backed site configuration and public metadata |
| `lib/env/` | Public/server environment validation with secret-safe errors |
| `lib/auth/` | Safe internal redirects, Auth Server Actions, action state and non-production E2E boundary |
| `lib/supabase/` | Typed browser/server Supabase clients plus SSR session refresh adapter |
| `tests/unit/` | Env, catalog, Supabase SSR adapter and Auth-boundary tests |
| `tests/e2e/` | Playwright + axe regression coverage for the validated visual/product surface |

The package/tooling baseline is defined by `package.json` and the committed lockfile. Do not duplicate exact versions here as an independent authority.

## Auth boundary

Supabase Auth is the identity authority. The supported application flows are Google OAuth and email/password with verification, resend, recovery/reset, cookie-backed SSR sessions and logout. Magic-link login is not part of the product.

`@supabase/ssr` owns cookie-backed session transport. The root Next.js proxy refreshes session cookies and validates identity with `supabase.auth.getClaims()` before protected `/app` routes execute. Server Components may use `getUser()` when they need the fresh Auth user record, but must not use a cookie-loaded session object as an authorization decision.

All post-auth return destinations pass through the central `/app` allowlist. OAuth and email confirmation use PKCE exchanges in Route Handlers. Authenticated responses are non-cacheable. The Playwright-only `E2E_AUTH_BYPASS` exists solely to exercise deterministic visual states without a hosted provider; it is ignored in production and is not an authentication mechanism.

Account display name remains stored in Supabase Auth `user_metadata`; the starter does not introduce a profile table without a product need for one.

## Database and authorization boundary

SQL migrations are the database-schema authority. Generated TypeScript types are derived from the local schema and are wired into all Supabase clients.

`public.example_resources` is a private, replaceable example domain. Ownership defaults to `auth.uid()` in Postgres; callers do not choose arbitrary owners. RLS allows authenticated users to read/delete only their own rows. Create/update additionally require the current-user Pro entitlement. A trigger prevents owner transfer even if an update attempts to modify `user_id`.

`public.billing_projection` is server-owned and has no direct authenticated-user grants. Its `paid_through` value is the authorization input used by the canonical `private.has_pro()` function. The public RPC wrapper accepts no `user_id` argument, so an authenticated caller can only ask about the current identity.

Free and revoked users retain read/delete access to existing owned Example resources. Current Pro entitlement enables create/edit. Server Actions provide the intended UI mutation boundary, but Postgres RLS remains the final authority for Data API access.

The database test suite exercises two authenticated users, anonymous access, immutable ownership, financial-write denial, Free/Pro/revoked transitions, and retained read/delete behavior against a real local Postgres instance.

## Trust boundaries

Public env reads use explicit `NEXT_PUBLIC_*` references. Secrets remain server-only. Supabase browser/server clients use the publishable key and never confer authorization by themselves.

Ordinary private product data is protected by Postgres RLS. Financial projection rows remain server-owned. A browser return from Stripe must never grant Pro.

The current private UI composes real Auth identity, real Example persistence and real database-backed entitlement checks with deterministic Billing sample state. Billing sample state is explicitly labeled and must not become an authority for persistence or entitlements.

## Module boundaries from Scope 2.0

Preserve these boundaries as implementation proceeds:

- `app/` owns routing, RSC composition, thin Server Actions, callbacks and explicit HTTP endpoints.
- Auth remains isolated from Billing and the Example domain.
- Ordinary user data uses the user's Supabase identity and Postgres RLS.
- Privileged Supabase/Stripe operations remain server-only and narrowly scoped.
- Billing owns Checkout/Portal, webhook processing, the reconstructible local financial projection and reconciliation.
- The Example Resource owns only its CRUD/domain behavior and must be replaceable without editing Auth, Billing, Account, configuration or the app shell.
- SQL migrations are the database-schema authority; generated TypeScript types are derived artifacts.

## Known gaps against Scope 2.0

The following are intentionally not represented as complete today:

- Stripe SDK integration, Checkout, Portal, webhook signature verification and paid-through projection writes;
- durable Checkout-attempt handling, event deduplication, concurrency protection and billing reconciliation;
- app ↔ Billing ↔ RLS integration driven by real Stripe lifecycle events;
- GitHub Actions CI and hosted release gates;
- billing/recovery runbooks and final Vercel deployment evidence.

Hosted Auth behavior has been validated during implementation, but every deployment still owns and must verify its own Google OAuth, Supabase Auth and Resend SMTP configuration. Provider QA evidence is not embedded as a starter credential or deployment dependency.

The catalog/env foundation still carries transitional amount configuration (`PRO_MONTHLY_AMOUNT` / `PRO_ANNUAL_AMOUNT`). Scope 2.0 instead makes Stripe Price the authority for amount, currency and recurrence. Treat those fields as an implementation gap to remove during Billing; do not build new product behavior around them.

The owned button currently uses Radix Slot. Scope 2.0 permits a selective shadcn-style/Base UI foundation, but no migration should be performed merely for fashion; primitives should change only when an implemented surface needs it and the resulting family remains coherent.

## Historical implementation evidence

Executed Phase 0 material is historical evidence only. It must not be used as product authority. Historical contracts live under `docs/archive/`; canonical requirements live only in `docs/product/SCOPE.md`.
