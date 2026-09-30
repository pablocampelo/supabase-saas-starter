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
| `components/ui/`, `components/shared/` | Small owned primitive/pattern layer used by public, Auth and private surfaces |
| `config/product.ts`, `config/site.ts`, `config/metadata.ts` | Product identity, navigation, environment-backed site configuration and public metadata |
| `lib/env/` | Public/server environment validation with secret-safe errors |
| `lib/auth/` | Safe internal redirects, Auth Server Actions, action state and non-production E2E boundary |
| `lib/supabase/` | Browser/server Supabase clients plus SSR session refresh adapter |
| `tests/unit/` | Env, catalog, Supabase SSR adapter and Auth-boundary tests |
| `tests/e2e/` | Playwright + axe regression coverage for the validated visual/product surface |

The package/tooling baseline is defined by `package.json` and the committed lockfile. Do not duplicate exact versions here as an independent authority.

## Auth boundary

Supabase Auth is the identity authority. The supported application flows are Google OAuth and email/password with verification, resend, recovery/reset, cookie-backed SSR sessions and logout. Magic-link login is not part of the product.

`@supabase/ssr` owns cookie-backed session transport. The root Next.js proxy refreshes session cookies and validates identity with `supabase.auth.getClaims()` before protected `/app` routes execute. Server Components may use `getUser()` when they need the fresh Auth user record, but must not use a cookie-loaded session object as an authorization decision.

All post-auth return destinations pass through the central `/app` allowlist. OAuth and email confirmation use PKCE exchanges in Route Handlers. Authenticated responses are non-cacheable. The Playwright-only `E2E_AUTH_BYPASS` exists solely to exercise deterministic visual states without a hosted provider; it is ignored in production and is not an authentication mechanism.

Account display name is currently stored in Supabase Auth `user_metadata`. This intentionally avoids introducing a profile table before the database/RLS phase.

## Trust boundaries

Public env reads use explicit `NEXT_PUBLIC_*` references. Secrets remain server-only. Supabase browser/server clients use the publishable key and never confer authorization by themselves.

Private product data must be protected by Postgres RLS when the Example Resource is connected. Financial facts must remain server-owned, and a browser return from Stripe must never grant Pro.

The current private UI composes real Auth identity with deterministic Billing/Example sample state until those implementation phases land. The sample state is explicitly labeled and must not become an authority for persistence or entitlements.

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

- hosted Google OAuth configuration and smoke verification;
- Supabase Auth → Resend SMTP configuration and hosted verification/recovery smoke tests;
- Postgres migrations, generated DB types and real RLS policies/tests;
- real Example persistence and Free/Pro entitlement enforcement;
- Stripe SDK integration, Checkout, Portal, webhook signature verification and paid-through projection;
- durable Checkout-attempt handling, event deduplication, concurrency protection and billing reconciliation;
- GitHub Actions CI and hosted release gates;
- billing/recovery runbooks and Vercel deployment evidence.

The catalog/env foundation still carries transitional amount configuration (`PRO_MONTHLY_AMOUNT` / `PRO_ANNUAL_AMOUNT`). Scope 2.0 instead makes Stripe Price the authority for amount, currency and recurrence. Treat those fields as an implementation gap to remove during Billing; do not build new product behavior around them.

The owned button currently uses Radix Slot. Scope 2.0 permits a selective shadcn-style/Base UI foundation, but no migration should be performed merely for fashion; primitives should change only when an implemented surface needs it and the resulting family remains coherent.

## Historical implementation evidence

Executed Phase 0 material is historical evidence only. It must not be used as product authority. Historical contracts live under `docs/archive/`; canonical requirements live only in `docs/product/SCOPE.md`.
