# Engineering guide

Read [Product Scope 2.0](docs/product/SCOPE.md) first. It is the **only product contract**. [Architecture](docs/ARCHITECTURE.md) explains current boundaries; [Setup](docs/SETUP.md) explains provider configuration; the [Billing runbook](docs/runbooks/BILLING.md) explains recovery.

Supabase SaaS Starter is **feature-closed**. Fix defects and maintain supported integrations, but do not introduce teams, more tiers, additional OAuth methods/providers, a CMS, generic APIs, analytics, workers, plug-ins, extra deployment targets or speculative abstractions without an explicit change to Scope.

## Preserve trust boundaries

- **Supabase Auth** is the identity authority. Every sensitive Server Action or endpoint authenticates and authorizes independently of layouts. Validate internal redirects.
- **SQL migrations** are the schema authority. Generate DB types from the actual database. RLS and constraints protect private user data even through the Data API; owners are immutable.
- **Stripe** is the financial authority. Browser redirects and subscription status alone do not grant Pro. Keep server-selected Prices, signed/idempotent webhooks, positive paid-invoice evidence, paid-through logic, concurrent processing safety and controlled reconciliation intact.
- **Example** is removable. It may depend on Auth/RLS/Billing entitlement; Auth and Billing must never depend on the Example domain.
- **Secrets** are server/provider-only. Do not log, commit or expose them to clients, tests or pull requests.

## Change discipline

1. Make the **smallest change that preserves the Scope**; keep the dependency graph straightforward.
2. Add focused tests for authorization, financial policies, callbacks, boundary failures or regressions. Do not weaken existing negative tests to make CI pass.
3. Use the pinned Node, pnpm, Supabase CLI and lockfile. Run relevant checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, local Supabase reset + pgTAP + generated types, and `pnpm test:e2e`.
4. Treat test bypass/fixtures as **non-production only**. Real hosted credentials and callback/payment behavior require separate verification.
5. Update only the documentation whose role actually changed: README for buyer onboarding, Scope for product decisions, Architecture for boundaries, Setup for provider steps, billing runbook for recovery.
6. Report executed evidence precisely. A local build is not proof of hosted Auth, billing or deployment.

Do not add alternate dependency managers, default ORMs, generic state managers, multiple UI themes or a second financial source of truth.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
