# Supabase SaaS Starter — Product Scope 2.0

**Status:** APPROVED / CANONICAL  
**Product:** Supabase SaaS Starter  
**Type:** Feature-closed SaaS foundation  
**Principle:** Minimum essential infrastructure, maximum adaptability

This is the **sole product contract**. Implementations, tests, documentation and future maintenance must respect it. Earlier specifications and development prompts are historical, not additive requirements. Changing an exclusion or the supported business model requires an explicit product decision.

## 1. Product and buyer

Supabase SaaS Starter is a premium, deliberately focused Next.js foundation for **technical founders and small teams (approximately 1–5 developers)** building an individual-account, recurring-subscription SaaS.

One user owns their own data and may receive one `pro` entitlement. There are no organizations, workspaces, memberships, roles or seats. The buyer's development team may have multiple people; the buyer's end-user account model does not.

**Supported stack:** Next.js App Router, React, strict TypeScript, Node.js LTS, Supabase Auth, Supabase Postgres with RLS, Stripe, Tailwind CSS and Vercel. Each core boundary has one supported implementation path, not a portfolio of interchangeable providers.

The buyer can clone the versioned repository, install reproducibly, configure branding and provider-owned environments, apply SQL migrations, deploy to Vercel, run individual-account Auth, isolate private data, sell monthly or annual Pro, use Stripe Customer Portal, diagnose/reconcile billing drift and **replace the Example Resource without rebuilding Auth, Billing or the foundation**.

The product is measured by the foundational work it removes, **not** by the number of features bundled.

## 2. Engineering principles

- **One supported path.** Avoid equivalent alternate implementations of core services.
- **Earn every permanent dependency.** Add infrastructure only when its absence breaks a core journey or regularly forces the buyer to rebuild a sensitive boundary.
- **No speculative abstraction.** Abstractions solve present repetition, not hypothetical future integrations.
- **Server/database authority.** UI state never establishes identity, ownership, authorization, entitlement or financial truth.
- **A replaceable Example.** Its only role is to prove Auth → ownership → RLS → Pro → CRUD.
- **Feature-closed, maintained.** Security updates, compatibility work, provider changes, defects, regressions and documentation corrections are maintenance; new features are not implied.
- **OUT means OUT.** Exclusions are not a hidden backlog. Do not invent future phases to reintroduce them.

## 3. Foundation and configuration

Use one Next.js App Router application with compatible React, strict TypeScript, a supported Node LTS, React Server Components where useful, Server Actions for UI mutations where appropriate, Route Handlers for explicit HTTP behavior, and **one package manager with a committed frozen lockfile**. Concrete dependency versions are fixed and verified at each release; the scope does not require automatic pursuit of the newest version.

**Versioned product configuration** owns name, branding, navigation, content, supported plans and currency. **Environment/provider configuration** owns secrets, Supabase connection, OAuth, SMTP, Stripe keys/Price IDs, deployment URLs and other environment-specific identifiers. Each value has one authority.

The logical catalog is exactly `free`, `pro_monthly`, `pro_annual`. Application code selects what can be purchased; Stripe Price determines amount, currency and recurrence. Public pricing may be derived/cached from validated Prices. An archived Price is not automatically invalid for a previously established subscription.

## 4. Identity and Auth email

**Supabase Auth is the only identity authority.** The two supported paths are:

- Google OAuth: signup/sign-in, callback, canceled/error state, cookie-backed session and validated private return path.
- Email/password: signup, verification, resend, sign-in, forgot/reset password, session and logout.

Use server-side Supabase identity verification appropriate to the pinned SDK. Every sensitive mutation rechecks identity and authorization. Authentication redirects accept only valid internal `/app` destinations, defaulting to `/app`. Do not automatically link accounts based only on matching email.

The Account surface exposes identity/email, display-name updates, recovery, logout and Help; manual account linking, advanced self-service email change and automatic account deletion are excluded.

**Auth email:** Supabase Auth → buyer-owned **Resend SMTP** for hosted confirmation and recovery. Document verified sender/domain, relevant DNS, SMTP, template callback routing and local vs hosted configuration; test real hosted delivery. Local Supabase uses email capture. Do not install an application email SDK/framework just for Supabase Auth.

## 5. Database, ownership and Example

Supabase Postgres is the supported database. **Versioned SQL migrations** are schema authority. Keep only necessary grants, constraints, indexes and minimal development seed; generate TypeScript DB types from the real schema. Do not maintain a second hand-written editable schema or introduce an ORM/repository framework by default.

A private resource belongs to one authenticated user. RLS must enforce row isolation, anonymous denial and immutable ownership, including direct Supabase Data API access. The client cannot assign/transfer owners, edit financial state or grant Pro; UI/Server Action checks never replace RLS.

The app includes a generic, honest **Dashboard** (greeting, actual plan/account status and useful navigation, no invented metrics) and one intentionally simple, replaceable **Example Resource** with fields conceptually `id`, `user_id`, `title`, `content`, timestamps.

| Entitlement | Create | Read own | Edit own | Delete own |
| --- | --- | --- | --- | --- |
| Free | No | Yes | No | Yes |
| Pro | Yes | Yes | Yes | Yes |
| Former Pro | No | Yes | No | Yes |

Retained data remains readable/deletable by its owner after Pro is lost. The Example must not become a dependency of Auth, Billing, Account, product configuration or the shared app shell.

## 6. Billing and financial truth

The entire monetization model is **Free + one Pro tier**, offered monthly or annually with identical `pro` access and one configured currency. Stripe owns Checkout, Customer, subscriptions, invoices, payment methods, Customer Portal, financial state, receipts and cancellation. The server chooses the supported offer; browser parameters cannot supply authoritative Price, customer, subscription or entitlement IDs.

**Stripe is the financial source of truth.** The application stores a minimal, reconstructible **billing projection**, not a user-editable `is_pro` boolean. Its semantic fields cover user/customer/subscription mapping, supported Price and interval, subscription state, last recognized paid financial period, `paid_through`, synchronization time and projection version/concurrency equivalent.

Expose exactly one current-user entitlement, `has_pro()`, through the database. Do not permit clients to query or mutate another user's financial entitlement by passing an arbitrary user ID.

**Paid-through rule:** Pro is based on a verified positive paid invoice for a correctly mapped, supported Stripe subscription and the **actual covered financial period**. Neither `subscription.status = active`, `current_period_end`, Checkout completion nor a browser redirect is sufficient.

- Checkout pending: no new Pro.
- Supported paid invoice: establishes/advances paid-through.
- Paid renewal: extends to the newly confirmed period, never a fabricated 30/365-day interval.
- Failed renewal, past-due or unpaid: no new period; only previously paid-through access remains.
- Cancellation at period end: retains already-paid access, grants no additional period.
- Immediate/terminal cancellation: projects the current Stripe state without inventing new access.
- Unsupported Price/state/currency/recurrence/amount or inconsistent mapping: **fail closed** for new access; remain diagnosable and reconcilable.
- Refund/dispute: record relevant event without extending access or automatically revoking an already-confirmed period. The buyer's refund policy may require a Stripe adjustment followed by reconciliation. Do not claim a universal automated revocation policy.

**Checkout and webhook correctness:**
- A durable checkout attempt, user/session association, appropriate Stripe idempotency keys and atomic open-attempt handling prevent competing subscriptions; incomplete attempts can be recovered/expired.
- Verify the **raw-body Stripe signature** and correct environment before processing; never trust browser financial identifiers.
- Do not return success before durable processing or a deliberate permanent ignore. Store unique event receipts without retaining full sensitive payloads indefinitely.
- Event-ID deduplication alone is insufficient: independent concurrent events must converge through versioned/transactional/locked projection updates. Do not hold database transactions open during external Stripe HTTP calls.
- Retry, reordered/duplicate events and crash recovery must be safe.

**Reconciliation:** ship a small operator command that reads current Stripe facts, compares local projection, reports safe drift, defaults to dry-run and requires explicit apply. Reuse the webhook's financial policy and fail closed on contradictory data. A default cron/worker/automatic recovery SLA is **not** provided: exhausted retries may require operator action.

## 7. Product experience

**Public:** one coherent Header, Hero, Features, Pricing, FAQ, CTA, Footer, Terms, Privacy and Help composition. **Private:** Dashboard, Example, Billing, Account and Help.

Billing displays actual plan/interval/state, paid-through when useful, confirmation/pending/error recovery, purchase CTA and an owner-only Customer Portal entry. A browser return never displays an unearned payment success.

Use Tailwind with one semantic light theme, accessible HTML and a **small owned component set**. Introduce behavior-heavy headless primitives selectively; do not install a full component gallery or incompatible primitive families. Forms use HTML, appropriate Server Actions/`useActionState`, server-side Zod and database constraints. State authority belongs to the server/DB, not localStorage or client caches. Do not add a generic form, client-state or server-state framework by default.

Public pages have appropriate title/description/canonical/Open Graph/robots/sitemap. Private pages are noindex. Terms/Privacy are explicitly editable **templates**, not published legal advice. Avoid artificial public example routes.

Provide public Help, configurable support email, actionable errors, safe operational diagnostics and a billing recovery runbook. Avoid tokens, secrets, sensitive payloads and unnecessary PII in logs. Do not build a helpdesk.

Protect materially costly or sensitive surfaces using Supabase Auth limits, request payload bounds, pagination, scoped billing attempt/cooldown controls, server authorization and RLS. Do not claim a universal WAF/anti-abuse product; direct Supabase Data API access depends on database controls, not Vercel WAF.

Security includes server-side identity/authorization, immutable owner, financial write restrictions, signed Stripe webhooks, safe redirects, request-size limits, secret isolation, appropriate headers/XSS/CSRF-origin defenses and supported dependency patches. A CSP must not break actual Auth/Checkout flows merely to appear stricter.

Keyboard operation, focus visibility, labels, usable errors, contrast, zoom and responsive layouts are required; perform automated accessibility checks on representative journeys. Do not claim universal WCAG certification.

## 8. Verification, CI and deployment

Prefer **few high-value tests** protecting critical invariants:
- Unit: redirects, environment parsing, catalog, paid-state policy.
- Integration/HTTP: signed webhooks, Checkout/Portal, server authorization and error paths.
- Real Postgres: users A/B, anonymous, immutable owner, financial write denial, Free/Pro/revoked gating, retained read/delete.
- Billing race cases: duplicated, concurrent and out-of-order events, stale projection writes, failures and competing Checkout attempts.
- Stripe test/sandbox: monthly/annual, browser closed, payment, renewal, failed payment, cancellation and reconciliation.
- Browser E2E: essential journeys and representative accessibility/responsive checks.

**Minimal GitHub Actions CI** verifies frozen install, lint, typecheck, tests, local Supabase reset + RLS, production build and critical browser E2E. Use least-privilege permissions and pinned trusted actions. Never execute untrusted PR code with production provider secrets.

**Before release**, gather hosted evidence on the candidate SHA for Google OAuth, real SMTP, signup confirmation, password recovery/callbacks, Stripe sandbox and remote webhooks, deployed Vercel and hosted Supabase. Providers need not run for every PR.

**Vercel is the only supported deployment target.** Keep local/staging/production isolated; no live secrets in staging. Verify migrations from a clean database, then migrate hosted databases in a controlled sequence (expand/contract when necessary); do not migrate on each preview deployment. Application rollback is not an automatic Postgres rollback.

## 9. Documentation and adaptability

Keep distinct, short sources of truth:
- `README.md`: buyer value, quick start, navigation.
- `docs/product/SCOPE.md`: what the product is and excludes (this file).
- `docs/ARCHITECTURE.md`: implementation and trust boundaries.
- `docs/SETUP.md`: environments, provider configuration and deployment.
- `AGENTS.md`: edit/test discipline for developers and coding agents.
- `docs/runbooks/BILLING.md`: Stripe diagnostics and reconciliation.

No agent-specific adapters, proprietary coding-agent layers or speculative plug-in architecture. Structure, generated types and tests must be legible to humans and agents without a specialized certification framework. Do not claim unmeasured AI productivity improvements.

**R6 adaptability acceptance:** following only distributed documentation, a developer or coding agent can rebrand, replace Example with a Projects-like domain, add a field, migrate, regenerate types, preserve owner/RLS/Pro rules, pass relevant tests and **leave Auth and Billing untouched**.

## 10. Explicit exclusions (OUT)

These features may be built by the buyer but are **not** integrated, certified or maintained by the starter:

- **Identity:** magic links, extra OAuth providers, MFA, SSO, alternative Auth, manual linking, advanced self-service email changes, automated account deletion.
- **Organizations:** teams, workspaces, invitations, memberships, seats, RBAC/roles.
- **Monetization:** one-time/lifetime sales, extra paid tiers, trials, coupons/promotions, usage billing, credits, seat billing, active interval switching, general entitlement engines and mandatory Stripe Entitlements.
- **Data/platform:** Storage/uploads, Realtime, CMS, alternate databases, default ORM or generic repository layer.
- **API:** generic public API, GraphQL, default tRPC/RPC framework or external SDK.
- **Background jobs:** generic queues/workers, event buses, schedulers and default reconciliation cron.
- **Marketing:** blog, CMS, lead capture, waitlist backend, testimonials gallery, UI catalog, multiple landing variants.
- **UI:** dark mode, theme switcher, multiple skins, unused component libraries, fake metrics and generic charts.
- **Email:** in-app email SDK, welcome notifications, campaigns or general notification platforms.
- **Analytics:** marketing/product analytics, conversion tracking, analytics dashboard.
- **Operations:** custom admin/helpdesk, impersonation, complex doctor, Management API readers, auto-provisioning/repair, generic observability stacks.
- **Architecture:** provider abstraction framework, plug-in system, default monorepo, extra supported runtimes or deployment targets.
- **Internationalization:** locale routes, translation system, multilingual SEO.
- **AI:** tool/vendor-specific layers, prompt packs, multi-agent certification.

## 11. Distribution and release acceptance

The **versioned Git repository/commit/tag** is the canonical distributable artifact. ZIPs or marketplace downloads are derived copies, never separately maintained implementations.

A release is ready **only if all relevant gates pass**:

| Gate | Required evidence |
| --- | --- |
| **R1 — Foundation** | Clean frozen install, lint, typecheck, tests, build, safe invalid configuration, no secret leakage |
| **R2 — Identity** | Google and password signup/login, verification/resend, recovery/reset, logout, invalid callback and unsafe redirect denial, hosted SMTP delivery |
| **R3 — Database** | Clean migrations and aligned generated types; A/B and anonymous isolation, immutable owner, financial-write denial, Free/Pro/revoked writes, retained own read/delete |
| **R4 — Billing** | Monthly/annual Checkout, browser-close safety, verified paid-through entitlement, signature denial, duplicate/concurrent/competing processing, renewal/failure/cancellation, owner Portal, historical Price, reconciliation repair |
| **R5 — Product** | Public/private screens, SEO and private noindex, responsive/keyboard/focus/error handling, no false payment success |
| **R6 — Adaptability** | Example replacement with Auth, Billing, RLS, entitlement and build intact |

## 12. Scale, maintenance and claims

Optimize initially for early SaaS adoption (roughly 0–1k users), with incremental evolution for successful products (roughly 1k–100k). **These are planning bands, not guaranteed capacity.** Evolve indexing, query plans, hosting/provider plans, caching, observability and targeted async work **only after actual operating evidence**. Do not prebuild an S3/high-volume architecture.

Maintain supported security, frameworks, Supabase/Stripe/Vercel compatibility, dependencies and regressions, prioritizing stability and simplicity over novelty. Feature-closed does not mean unmaintained.

Claim only properties demonstrated by release evidence: integrated Auth/private data/Billing, RLS-backed isolation, browser-independent paid provisioning, diagnosable/recoverable billing drift, a replaceable Example and reproducible verification. **Do not claim** quantified time saved, universal performance limits/readiness, complete elimination of billing edge cases, zero maintenance, superiority to every alternative or unmeasured coding-agent productivity.

**Engineering may choose** schema layout, helpers, internal names, bounded concurrency mechanisms, UI composition and testing structure that respect this contract. Engineering may **not** introduce a new provider, commercial model, authentication method, organizations, excluded feature or deployment target through an internal refactor or ADR.

> Build the difficult foundation once. Keep everything else out of the way.
