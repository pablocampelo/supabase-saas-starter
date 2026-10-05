# Engineering contract

`docs/product/SCOPE.md` is the sole product authority. Read it before changing product behavior.

Use these documents for distinct jobs:

- `docs/product/SCOPE.md` — what DaysNotWeeks supports and excludes.
- `docs/ARCHITECTURE.md` — how the current repository implements that contract.
- `docs/SETUP.md` — how to configure and run the current implementation.
- `docs/runbooks/` — operational recovery procedures when present.
- `docs/archive/` — historical context only; never derive current requirements from it.

If implementation, documentation, tests, or archived material conflict with `docs/product/SCOPE.md`, do not expand the conflicting behavior. Treat it as a gap to reconcile.

## Product boundaries

DaysNotWeeks supports one deliberately narrow stack: Next.js App Router, strict TypeScript, Supabase Auth, Supabase Postgres + RLS, Stripe, Tailwind CSS, and Vercel.

Do not introduce alternate providers, provider abstractions, organizations, teams, RBAC, additional auth methods, dark mode, analytics, application email, storage/uploads, generic APIs, queues, workers, cron infrastructure, ORMs, or other OUT capabilities unless `docs/product/SCOPE.md` is explicitly changed first.

Supported authentication is exactly Google OAuth plus email/password with verification and recovery. Magic links are not supported.

## Trust boundaries

Never trust client-controlled identity, owner, Price ID, customer ID, subscription ID, entitlement, or financial state.

Sensitive mutations must authenticate and authorize independently of page/layout protection. Private data must remain protected by Postgres RLS.

The client must not be able to assign another owner, transfer ownership, write financial projection state, or grant itself Pro. Use unprivileged Supabase clients for ordinary user data. Privileged credentials must remain server-only and narrowly scoped.

## Billing invariants

Stripe is the financial source of truth. Pro access is derived from the local, reconstructible billing projection defined by the product contract. Do not reduce billing authorization to a client flag, browser redirect, or isolated `subscription.status`.

A successful browser return never grants Pro.

Billing implementation must preserve verified webhook signatures, durable/idempotent effects, paid-through semantics, one supported Checkout attempt per account at a time, protection against stale concurrent projection writes, and recoverable reconciliation using the same financial calculation as webhook processing.

Do not create a generic entitlement engine, accounting ledger, event bus, queue system, or scheduler to satisfy these requirements.

## Example resource

The Example Resource proves only this vertical integration:

`Auth → ownership → RLS → Pro → CRUD`

It must remain replaceable. Free users may read/delete retained own Example data. Pro users may create/read/edit/delete their own data. Losing Pro removes premium writes without making retained own data inaccessible.

Auth and Billing must never depend on the Example domain.

## Configuration and schema

Product configuration belongs in versioned code. Secrets and environment-specific provider identifiers belong in environment/provider configuration. Stripe Prices are authoritative for monetary amount, currency, and recurrence.

SQL migrations are the schema authority. Generate TypeScript database types from the real schema; do not maintain a second hand-written schema representation. Do not add an ORM or generic repository layer by default.

## Verification

Do not weaken authorization, RLS, billing invariants, negative tests, or release evidence to make checks pass.

Use the committed package manager and lockfile. Canonical local checks are the scripts actually present in `package.json`, including as applicable frozen install, lint, typecheck, tests, DB/RLS tests, production build, and critical Playwright tests.

A passing local build does not prove hosted OAuth, SMTP, Stripe, or deployment behavior. Never report missing credentials, skipped provider verification, or unavailable evidence as PASS.

## Documentation discipline

Do not duplicate the full product contract in implementation documents.

Update `SCOPE.md` only for an explicit product-scope decision; `ARCHITECTURE.md` when implemented architecture changes; `SETUP.md` when supported setup changes; runbooks when operational recovery changes; and `README.md` only for concise onboarding.

Historical phase prompts and archived contracts are non-authoritative.

## Definition of done

For each change:

1. stay inside the requested scope;
2. preserve product invariants;
3. add or update the smallest useful tests;
4. run the relevant repository checks;
5. update only the documentation whose responsibility actually changed;
6. report changed files, executed checks, and unresolved evidence accurately;
7. never print or commit secrets.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
