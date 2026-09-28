# Current architecture

`docs/product/SCOPE.md` is the sole product contract. This document describes the repository as it exists now; it does not claim that the full Scope 2.0 product is already implemented.

## Implemented foundation

| Location | Current responsibility |
| --- | --- |
| `app/layout.tsx`, `app/globals.css` | App Router root, local fonts, semantic light-theme tokens |
| `app/(marketing)/page.tsx` | Minimal noindex foundation preview; not the final marketing surface |
| `components/ui/button.tsx` | One owned shadcn-compatible primitive using Radix Slot |
| `config/product.ts` | Brand, SEO, navigation/legal placeholders, currency and plan labels |
| `config/site.ts` | Server-side combination of product config and validated environment |
| `config/catalog.ts`, `config/catalog-schema.ts` | Current Phase 0 purchasable-catalog shape and validation |
| `lib/env/` | Public/server environment validation with secret-safe errors |
| `lib/supabase/` | Browser and request-scoped unprivileged Supabase client factories |
| `tests/unit/` | Env, catalog and Supabase cookie-adapter behavior |
| `tests/e2e/` | Playwright + axe foundation smoke |

The current package/tooling baseline is defined by `package.json` and the committed lockfile. Do not duplicate exact versions here as an independent authority.

## Trust boundaries already established

Public env reads use explicit `NEXT_PUBLIC_*` references. Server-only modules are guarded where appropriate. Supabase client factories use the publishable key only and do not confer authorization. A client factory must never be treated as an auth guard.

Future sensitive operations must authenticate and authorize independently. Supabase remains the identity authority, private data must be protected by Postgres RLS, financial facts must remain server-owned, and a browser return from Stripe must never grant Pro.

## Target module boundaries from Scope 2.0

As implementation proceeds, preserve these boundaries:

- `app/` owns routing, RSC composition, thin Actions, callbacks and HTTP endpoints.
- Auth concerns remain isolated from billing and the Example domain.
- Ordinary user data uses the user's Supabase identity and RLS.
- Privileged Supabase/Stripe operations remain server-only and narrowly scoped.
- Billing owns Checkout/Portal, webhook processing, the reconstructible local financial projection and reconciliation.
- The Example Resource owns only its CRUD/domain behavior and must not become a dependency of Auth or Billing.
- SQL migrations are the database-schema authority; generated TypeScript types are derived artifacts.

## Known gaps against Scope 2.0

The following are intentionally not represented as complete today:

- Google OAuth and email/password verification/recovery/session flows;
- protected application routes and session refresh handling;
- Postgres migrations, generated DB types and real RLS policies/tests;
- Dashboard, replaceable Example Resource, Account, Billing and Help surfaces;
- Stripe SDK integration, Checkout, Portal, webhook signature verification and paid-through projection;
- durable Checkout-attempt handling, event deduplication, concurrency protection and billing reconciliation;
- Resend SMTP configuration and hosted auth verification;
- GitHub Actions CI and hosted release gates;
- billing/recovery runbooks and Vercel deployment evidence.

The current catalog/env foundation also still carries Phase 0 amount configuration (`PRO_MONTHLY_AMOUNT` / `PRO_ANNUAL_AMOUNT`). Scope 2.0 instead makes Stripe Price the authority for amount, currency and recurrence. Treat the existing amount fields as an implementation gap to remove when billing/catalog is implemented; do not build new product behavior around them.

The current owned button uses Radix Slot. Scope 2.0 permits a selective shadcn-style/Base UI foundation, but no migration should be performed merely for fashion; introduce or replace primitives only when the implemented UI needs them and the resulting single primitive family is coherent.

## Historical implementation evidence

Executed Phase 0 material is historical evidence only. It must not be used as product authority. Historical contracts live under `docs/archive/`; the canonical requirements live only in `docs/product/SCOPE.md`.
