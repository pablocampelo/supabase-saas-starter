# DaysNotWeeks — BUILD_SPEC

- **Status:** IMPLEMENTATION CONTRACT
- **Target:** DaysNotWeeks V1 Scope 1.1
- **Date:** 2026-09-24
- **Canonical product contract:** `docs/product/V1_SCOPE.md`
- **Precedence:** `V1_SCOPE.md` wins over this document if any conflict exists.
- **Purpose:** translate the approved product contract and the approved visual/product decisions into an execution-ready specification for Engineering/Codex.

---

## 0. Non-negotiable scope reconciliation

Before implementation, reconcile the design discussion against the canonical V1 scope.

### 0.1 Auth methods

V1 Scope 1.1 supports exactly three auth paths under Supabase Auth:

- Google OAuth signup/login
- magic-link signup/login
- email/password signup/login with verification, resend, and forgot/reset password

All three share Supabase identity/session handling, logout, and safe callback/internal-return handling. Email/password remains a supported fallback. Same-email behavior across methods must follow Supabase's supported guarantees/configuration and be documented and tested; never add unsafe manual account linking by email.

The canonical V1 scope explicitly keeps the following **POST-V1**:

- additional OAuth providers beyond Google
- MFA / SSO

Alternative auth frameworks remain outside V1; Supabase Auth is the sole identity authority.

The approved V1.1 amendment includes Google OAuth and magic link in C02/PC02/AC02 and G2. Document Google project/consent/callback configuration and SMTP/link delivery per environment. Buyers may disable methods through configuration, but the DNW release must support, document, and test all three. This does not expand Phase 0 beyond foundations.

### 0.2 Notes entitlement

Canonical behavior:

- Notes are private and user-owned.
- Pro users may create and edit their own notes.
- Free users may not create or edit notes.
- A user who loses Pro keeps read and delete access to their own retained notes.
- Notes exist as a replaceable EXAMPLE, not as a product that DNW should expand.

Therefore:

- Free dashboard copy must never claim that Free can create/manage notes.
- Fresh Free users see an upgrade-oriented Notes empty state.
- Downgraded Free users can read/delete retained notes but cannot edit them.
- Do not add tags, folders, sharing, files, realtime, rich-text, collaboration, search infrastructure, or other business features.

### 0.3 Account management

V1 includes:

- view email/identity
- edit display name
- password recovery/reset
- logout
- a documented, authenticated support procedure for sensitive email changes and account deletion

V1 does **not** require:

- self-service email change
- automated self-service account deletion
- admin dashboard

### 0.4 Theme

V1 delivers:

- one editable, accessible theme
- semantic design tokens

V1 does **not** deliver:

- dark mode
- theme selector
- decorative theme variants

### 0.5 Public content example

V1 requires one removable static public content page that demonstrates how to extend SEO/publication correctly.

This page must be:

- clearly classified as EXAMPLE
- removable without breaking build, sitemap, metadata, navigation, or SEO
- documented in customization instructions

---

# 1. Product thesis

DaysNotWeeks V1 is a verifiable SaaS foundation for individual-account subscription products built with:

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres
- Row Level Security
- Stripe subscriptions
- Vercel

It is intentionally focused.

It is **not**:

- a teams/workspaces/orgs starter
- a universal monetization kit
- a one-time/lifetime payments starter
- a CMS/blog engine
- an analytics product
- an app-email framework
- a marketing-component library
- a dark-mode/theme showcase

The implementation must optimize for:

1. correctness of auth/data/billing
2. clear boundaries
3. buyer editability
4. AI-agent legibility
5. reproducible verification
6. low adaptation cost

---

# 2. Engineering operating rules

## 2.1 Scope discipline

Do not add:

- features not required by `V1_SCOPE.md`
- abstractions without an active requirement
- alternate providers
- alternate routers
- dormant P2 code
- generic plugin systems
- unused UI components
- fake product data or fake analytics

When uncertain, prefer the smaller implementation that satisfies PC/AC/AR.

## 2.2 Verification before completion

Each implementation slice must:

- typecheck
- lint
- run relevant tests
- build if the slice affects runtime/build
- report unresolved risks explicitly

Do not mark a slice complete because the UI renders.

## 2.3 Security boundary

Never trust the client for:

- user identity
- owner IDs
- Stripe customer IDs
- Stripe price IDs
- subscription state
- Pro grants
- billing period
- redirect targets outside the allowed internal return-path policy

Sensitive authorization is server-side and RLS-backed.

---

# 3. Repository and implementation shape

Preserve the repository's existing package manager and lockfile if a valid one exists.

If the repository is greenfield, use `pnpm`.

Use a single Next.js application.

Recommended top-level shape:

```text
app/
  (marketing)/
  (auth)/
  (app)/
  api/
components/
  app/
  auth/
  billing/
  marketing/
  notes/
  shared/
  ui/
config/
lib/
  auth/
  billing/
  db/
  security/
  seo/
  supabase/
supabase/
  migrations/
  seed.sql
scripts/
docs/
tests/
AGENTS.md
.env.example
```

This shape is a recommendation, not permission to violate existing coherent structure.

---

# 4. Stack decisions

Resolve exact versions during Phase 0 from current stable releases and record them in the lockfile.

Requirements:

- Next.js App Router only
- React version supported by selected Next.js
- TypeScript strict
- Tailwind CSS
- one current shadcn-compatible primitive stack
- Lucide icons
- Zod for application/env input validation unless the existing codebase has an equivalent single solution
- official Supabase JS/SSR packages
- official Stripe Node SDK
- Playwright for browser E2E unless an existing equivalent is already installed
- an automated accessibility check suitable for the app routes
- no ORM unless it materially improves the contract and does not undermine SQL/RLS transparency

Prefer SQL migrations and generated Supabase types for the database contract.

---

# 5. Design system

## 5.1 Visual direction

The design combines:

- Taxonomy-style product UI discipline
- Stalkr-style marketing composition
- DNW-specific neutral implementation

Design character:

- minimal
- premium
- neutral
- technical
- high whitespace
- border-first
- low decoration
- easy to rebrand
- easy for coding agents to understand

Do not add:

- gradients as decoration
- glassmorphism
- oversized pill UI
- large diffuse shadows
- decorative illustrations
- fake dashboards
- excessive card nesting

## 5.2 Typography

### UI/body

**Inter**

Use for body, nav, forms, labels, table/list content, helper text, buttons, and functional copy.

### Display/headings

**Funnel Sans**, weight 600 for major headings.

Marketing heading scale:

```text
Hero / H1 desktop: 64px / 1.01 / -0.035em / 600
Section / H2 desktop: 56px / 1.02 / -0.025em / 600
Section / H2 mobile: 40px / 1.02 / -0.025em / 600
Feature / H3 desktop: 40px / 1.05 / -0.02em / 600
Feature / H3 mobile: 26px / 1.05 / -0.02em / 600
```

App page title:

```text
mobile: 30px
desktop: 36px
weight: 600
line-height: ~1.05
letter-spacing: -0.02em
```

Do not use Cal Sans.

## 5.3 Colors

One light theme.

Base philosophy:

- white background
- near-black foreground
- cool neutral muted surfaces
- soft cool-gray borders
- near-black primary
- white primary foreground
- muted gray secondary/accent
- semantic red only for destructive/error
- semantic green only for confirmed/success
- orange accent reserved for marketing eyebrows where used

Use semantic CSS variables:

```text
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--success
--warning
--info
--brand
--brand-foreground
```

`--brand` may default close to `--primary`.

## 5.4 Radius

```text
base / lg: 8px
md: 6px
sm: 4px
```

## 5.5 Borders and shadows

- thin neutral border
- `shadow-sm` at most for cards/popovers
- no floating glass cards
- use whitespace and hierarchy before elevation

## 5.6 Controls

Button heights:

```text
sm: 36px
default: 40px
lg: 44px
```

Inputs/selects:

```text
height: 40px
text: 14px
horizontal padding: 12px
```

Button variants:

- default
- secondary
- outline
- ghost
- destructive
- link

Avoid unnecessary variants.

## 5.7 Icons

Lucide only.

Typical sizes:

```text
16px compact control
18px nav/action
20px standalone utility
```

Use `currentColor`.

---

# 6. Layout system

## 6.1 Global container

- centered container
- desktop max width around 1400px
- desktop horizontal padding around 32px
- responsive smaller padding on mobile
- preserve generous vertical rhythm

## 6.2 App shell

Desktop:

- top header: 64px
- left sidebar: 200px
- sidebar/content gap: 48px
- no app footer
- main background: same primary app surface, not gray admin canvas

Sidebar:

```text
Dashboard
Notes
-----------
Billing
Account
Help
```

Header:

- brand at left where appropriate
- user menu at right
- no marketing links
- no fake global search

Mobile:

- 64px header
- sidebar becomes a Sheet/drawer
- same navigation items
- no separate mobile information architecture

---

# 7. Route map

## 7.1 Public

```text
/
/terms
/privacy
/help
/example
```

Pricing and FAQ live on the landing page as anchored sections unless a separate route is later explicitly approved.

Recommended anchors:

```text
/#features
/#pricing
/#faq
```

## 7.2 Auth

```text
/login
/signup
/verify-email
/forgot-password
/reset-password
/auth/callback
/auth/error
```

`/login` and `/signup` expose Google OAuth, magic link, and email/password. Use the shared `/auth/callback` for supported OAuth/link completion and safe internal returns, with `/auth/error` for recoverable failures. Verification and password recovery retain their routes above; magic-link request/sent/resend states can live within the existing auth screens. Additional OAuth providers remain outside V1.

## 7.3 Authenticated app

```text
/app
/app/notes
/app/notes/[noteId]
/app/billing
/app/account
/app/help
```

`/app/help` may reuse the same support content component as public `/help`.

## 7.4 System

Use Next.js-native:

- `not-found.tsx`
- `error.tsx`
- `loading.tsx`
- route-level error/loading boundaries where useful

Private routes must be non-indexable.

---

# 8. Marketing landing page

The landing is intentionally short.

Final sequence:

```text
Header
Hero
From clone to product
What's included
Pricing
FAQ
Final CTA
Footer
```

Do not add testimonials, logo clouds, blog previews, analytics, or filler sections.

## 8.1 Header

Left: `DaysNotWeeks`

Right:

- Features
- Pricing
- FAQ
- Sign in
- Get started

Mobile: brand + compact menu trigger; preserve primary CTA if space allows.

## 8.2 Hero

Eyebrow: `THE SAAS FOUNDATION`

H1:

`Ship your SaaS.`  
`Skip the foundation work.`

Body:

`A verifiable Next.js starter with account recovery, private data, recurring subscriptions, account flows, and the hard billing edge cases already wired.`

Primary CTA: `Get started`

Secondary CTA: `Explore the demo`

Stack line: `Next.js · TypeScript · Supabase · Stripe · Vercel`

Hero visual:

- real fragments of the starter
- auth
- Notes
- billing
- account
- no fake KPIs

## 8.3 From clone to product

Eyebrow: `FROM CLONE TO PRODUCT`

H2:

`Everything between setup`  
`and your actual product.`

Body:

`Start from a working SaaS instead of assembling auth, billing, data access, and account flows again.`

Four blocks:

### 01 — Configure your product.

`Set your brand, URLs, plans, auth configuration, and product defaults from a small set of obvious places.`

### 02 — Authentication already works.

`Sign up, verification, resend, sign in, recovery, session handling, logout, and safe return paths are wired into the flow.`

### 03 — Billing survives the real world.

`Checkout starts the subscription. Signed webhooks establish trusted state. Reconciliation repairs drift when browsers, retries, or event ordering do not behave perfectly.`

### 04 — Replace the example with your product.

`Notes demonstrates private user data, row-level security, Pro-only writes, and safe downgrade behavior without pretending to be your actual SaaS.`

## 8.4 What's included

Eyebrow: `WHAT'S INCLUDED`

H2:

`The parts every SaaS needs.`  
`Already working together.`

Six capability cards:

### Authentication

`Google OAuth, magic-link login, and email/password with verification and recovery, shared sessions, logout, and safe callbacks.`

### Private data

`Supabase Postgres with user-owned data and row-level security at the database boundary.`

### Subscriptions

`Free and Pro, monthly and annual billing, Stripe Checkout, and Customer Portal.`

### Account flows

`Profile, identity, billing, help, and recovery journeys built as responsive screens.`

### Production safeguards

`Signed webhooks, idempotent processing, reconciliation, negative tests, and explicit failure states.`

### AI-friendly architecture

`Predictable structure, centralized configuration, semantic UI, canonical invariants, and modification guidance.`

## 8.5 Pricing

Visual composition must be centered, faithful to the approved Stalkr reference:

1. centered eyebrow
2. centered H2
3. centered subtitle
4. centered monthly/annual toggle
5. two centered plan cards
6. centered microcopy

Eyebrow: `PRICING`

H2: `Start free. Upgrade when you need it.`

Subtitle:

`One product, two plans, monthly or annual. The same billing model the starter demonstrates end to end.`

Toggle:

- Monthly
- Annual

### Free

Display price from the single canonical catalog.

Copy:

`A real free account with recovery, account settings, and safe retained-data access.`

Representative bullets:

- Account & recovery
- App shell
- Read retained own notes
- Delete retained own notes
- Billing upgrade path

CTA: `Get started`

### Pro

Badge: `MOST POPULAR`

Dark card.

Copy:

`Unlock the premium write capability demonstrated by the starter.`

Representative bullets:

- Everything in Free
- Create notes
- Edit notes
- Monthly or annual subscription
- Stripe Customer Portal
- Server-derived Pro access

CTA: `Get Pro`

Microcopy:

`Cancel through the Customer Portal. Access follows trusted server-side billing state, not the browser redirect.`

Important:

- Public prices must come from the canonical catalog.
- Checkout must use the same configured price IDs.
- No trials.
- No promotions.
- No interval switch for an active subscription.
- No lifetime plan.

## 8.6 FAQ

Visual composition:

- left column: eyebrow + large heading + body
- right column: numbered accordion
- thin dividers
- circular plus trigger

Eyebrow: `FAQ`

H2:

`Know what you're`  
`starting from.`

Body:

`A focused foundation is easier to understand, adapt, and trust.`

Questions:

1. What is DaysNotWeeks?
2. What is already implemented?
3. Why Supabase?
4. How is Stripe handled?
5. Does access depend on the Checkout success page?
6. Can I replace Notes with my own product?
7. Does it support teams or organizations?
8. Is it designed for AI coding agents?
9. Can I change the design system?
10. Where does it deploy?

Answers must remain truthful to `V1_SCOPE.md`.

Describe Google OAuth, magic link, and email/password as supported V1.1 scope; distinguish approved scope from actual implementation and verified release evidence.

## 8.7 Final CTA

Eyebrow: `START BUILDING`

H2:

`Start with the foundation.`  
`Build the part that's yours.`

Body:

`Authentication, billing, private data, account flows, and production plumbing are already there.`

Actions:

- Get started
- Explore the demo

## 8.8 Footer

Brand: `DaysNotWeeks`

Tagline: `A focused SaaS foundation for Next.js.`

Product:

- Features
- Pricing
- Demo
- Sign in

Resources:

- Help
- Documentation

Legal:

- Privacy
- Terms

No blog links.

---

# 9. Auth screens

All auth screens use the approved Taxonomy-like composition:

- no heavy card shell
- centered narrow form
- large whitespace
- back link at top-left where relevant
- small neutral brand mark
- Funnel Sans heading
- Inter UI
- 40px controls
- Google OAuth and magic-link entry options alongside email/password on login/signup

## 9.1 Login

Heading: `Welcome back`

Subtitle: `Sign in with Google, an email link, or your password.`

Email/password fields:

- Email
- Password

Actions:

- Continue with Google
- Send magic link (email required; no password required)
- Forgot password?
- Sign in
- Don't have an account? Sign up

States:

- submitting
- invalid credentials
- unverified account
- expired session
- safe return destination
- OAuth pending, canceled, or failed
- magic-link sending, sent, not received, resend/cooldown, or expired/reused
- invalid callback with a safe retry path

## 9.2 Signup

Heading: `Create an account`

Subtitle: `Create your account to get started.`

Email/password fields:

- Name
- Email
- Password

Actions:

- Create account
- Terms
- Privacy
- Already have an account? Sign in

Also offer `Continue with Google` and `Send magic link` (email required; no password required), with the same safe pending/error/retry states as login. Google and magic link may unify signup/login where supported by Supabase; do not require password creation for these paths.

After successful email/password signup, require/handle verification according to configured Supabase email-confirmation behavior and show Verify Email state. Magic-link requests show a check-email state with safe resend/cooldown feedback; successful Google/link completion establishes the shared session and preserves the permitted internal destination.

## 9.3 Verify email

Heading: `Verify your email`

Body: `We sent a verification link to {email}.`

Secondary body: `Click the link in the email to activate your account.`

Actions:

- Resend verification email
- Back to sign in

States:

- resend pending
- resend success
- rate-limited
- expired/reused verification link
- already verified

## 9.4 Forgot password

Heading: `Forgot your password?`

Subtitle: `Enter your email and we'll send you a reset link.`

Field: Email

Actions:

- Send reset link
- Back to sign in

Avoid account enumeration.

## 9.5 Password reset sent

Heading: `Check your email`

Body: `We've sent a password reset link to {email}.`

Secondary body: `Click the link in the email to reset your password.`

Actions:

- resend link where safe
- back to sign in

Do not depend on an `Open email` deep link for correctness.

## 9.6 Reset password

Heading: `Set a new password`

Subtitle: `Choose a new password for your account.`

Fields:

- New password
- Confirm password

Action: `Update password`

## 9.7 Reset success

Heading: `Your password has been updated.`

Body: `You can now sign in to your account with your new password.`

Action: `Continue to sign in`

## 9.8 Auth error

Heading: `Something went wrong`

Copy must be safe and useful.

Include:

- correlation/request ID if available and safe
- Try again
- Contact support

Never expose tokens, raw provider errors, secrets, stack traces, or customer identifiers.

---

# 10. App dashboard

Route: `/app`

Purpose:

- demonstrate composition of existing SaaS primitives
- provide a reusable starter overview
- never invent analytics

## 10.1 Header

Title: `Dashboard`

Subtitle: `Welcome back, {firstName}. Here's an overview of your account.`

## 10.2 Current plan

For Free:

- Free
- `You're currently on the Free plan.`
- CTA: `Upgrade to Pro`

Do not claim note creation.

For Pro:

- Pro
- status
- current paid-through date
- billing interval
- CTA: `Manage subscription`

For pending/failure:

- explicit non-success status
- never show false confirmation

## 10.3 Recent notes

If notes exist:

- up to 3–4 recent notes
- title
- updated time
- View all

Permissions:

- Pro: read/edit/delete as allowed
- Free downgraded: read/delete, not edit

If fresh Free user has no notes:

- show a small premium-empty state
- `Creating notes is a Pro feature.`
- CTA: `Upgrade to Pro`

Do not show `New note` to Free as if it will succeed.

## 10.4 Account

Show:

- display name
- email
- email verified state
- Manage account

Any displayed Google connection state must reflect the verified Supabase identity; do not invent a connection or add manual account-linking controls.

## 10.5 Upgrade surface

Free only:

Heading: `Unlock Pro`

Copy: `Create and edit your private Notes example with a Pro subscription.`

CTA: `View plans`

For Pro, remove this block rather than replacing it with filler.

---

# 11. Notes reference feature

Notes is EXAMPLE.

Schema contract:

```text
id
user_id
title
body
created_at
updated_at
```

No additional business fields unless required for DB correctness.

## 11.1 Notes list

Route: `/app/notes`

Header: `Notes`

Subtitle: `Create and manage your private notes.`

Pro:

- `New note` button
- list of notes
- row actions: open, delete
- edit occurs on detail page

Free with retained notes:

- list notes
- read
- delete
- no edit
- upgrade CTA

Fresh Free with no notes:

Heading: `No notes yet`

Copy: `Creating notes is a Pro feature in this reference app.`

CTA: `Upgrade to Pro`

## 11.2 Note detail

Route: `/app/notes/[noteId]`

Do **not** implement a rich-text editor.

Pro:

- title input
- plain textarea/body editor
- save state
- delete action

Free downgraded:

- read-only title/body
- delete action
- upgrade-to-edit CTA

Server and RLS must enforce the same policy even if the UI is bypassed.

## 11.3 Delete confirmation

Use a destructive confirmation dialog.

Copy:

`Delete note?`

`This action cannot be undone.`

Actions:

- Cancel
- Delete note

Delete is allowed for the owner regardless of current Pro status.

---

# 12. Billing product model

## 12.1 Commercial model

Exactly:

- Free
- Pro monthly
- Pro annual
- one currency configured
- at most one current subscription per account
- no trial
- no promotion
- no lifetime/one-time
- no active interval switching

## 12.2 Canonical catalog

Implement one server-owned catalog.

It must define at minimum:

```text
currency
free plan metadata
Pro monthly price ID
Pro annual price ID
expected display amount
billing interval
active/supported flags
```

Public pricing and Checkout must derive from this catalog.

Client input may select only an allowed interval identifier.

Never accept arbitrary Stripe `price_id` from the browser.

## 12.3 Billing data model

Names may vary, but behavior must support:

### Customer mapping

One stable mapping:

```text
user_id -> stripe_customer_id
```

Created/linked server-side.

### Subscription projection

Track the current subscription projection needed by UI/operator:

```text
user_id
stripe_subscription_id
stripe_customer_id
stripe_price_id
interval
status
current_period_start
current_period_end
cancel_at_period_end
canceled_at
updated_from_stripe_at
```

The user cannot write it.

### Paid-period grants / entitlement facts

Use a durable representation sufficient to prove which paid invoice/payment finances access.

Recommended fields:

```text
user_id
stripe_subscription_id
stripe_invoice_id
stripe_payment_intent_id
period_start
period_end
state
refund_state
dispute_state
created_at
updated_at
```

Access must be derived from trusted paid facts, not a client flag.

### Event ledger

Persist webhook receipt/application state:

```text
stripe_event_id (unique)
event_type
object_id
received_at
processing_started_at
applied_at
status
attempt_count
last_error_safe
```

Status names may differ.

The system must make failures/retries/discrepancies visible to an operator.

## 12.4 Entitlement policy

Pro write access exists only when trusted server-side facts show an active paid entitlement according to the canonical policy.

Required behavior:

- initial payment pending/failed -> no Pro
- paid invoice -> grant only its paid period
- renewal paid -> extend once
- past_due -> do not grant a new period
- cancel at period end -> keep through already-paid end
- immediate cancellation -> terminate access for that subscription
- full refund of current paid invoice -> revoke that financed period
- partial/old refund -> visible to operator; do not revoke unrelated current period automatically
- relevant open dispute -> suspend financed access
- dispute lost -> revoke
- dispute won -> restore only if the period remains valid and not refunded
- unsupported state/price/model -> do not infer new access

## 12.5 Checkout

Authenticated only.

Server process:

1. resolve authenticated user
2. validate requested interval against canonical catalog
3. get/create user's Stripe customer
4. check no current subscription exists
5. create Checkout Session with server-owned price ID
6. use an idempotency strategy
7. record a checkout attempt if useful for duplicate-prevention and pending UI
8. return Checkout URL

Do not grant Pro from Checkout creation.

## 12.6 Browser return

The success return page is informational only.

Allowed UI states:

- confirming
- confirmed
- failed
- expired
- needs attention

The redirect/query string never grants Pro.

## 12.7 Webhook

Requirements:

- use raw body required for Stripe verification
- verify Stripe signature before processing
- reject invalid signatures
- persist event ID uniquely
- make application idempotent
- tolerate duplicate delivery
- tolerate out-of-order delivery
- tolerate concurrent delivery

For events that can race, prefer reconciling against current Stripe truth rather than trusting event arrival order.

## 12.8 Reconciliation

Deliver a repeatable privileged operator command.

Recommended shape:

```text
pnpm dnw:billing:reconcile --user <userId> --dry-run
pnpm dnw:billing:reconcile --user <userId> --apply
```

Or an equivalent canonical command.

Requirements:

- dry-run by default where practical
- never callable by a normal authenticated user
- retrieves trusted Stripe state
- compares Stripe facts to DB projection/grants
- reports discrepancies
- can apply a bounded repair
- emits safe correlation/report data
- no secrets in output

A small fixture must converge to correct state within the acceptance window once dependencies are healthy.

## 12.9 Customer Portal

Portal session:

- authenticated user only
- use only that user's mapped customer
- no customer ID accepted from browser

Portal configuration must not advertise unsupported active interval switching.

Document the required Stripe Portal settings.

---

# 13. Billing UI

Route: `/app/billing`

Page title: `Billing`

Subtitle: `Manage your plan and subscription.`

## 13.1 Free

Show:

- Current plan: Free
- monthly/annual Pro choice
- CTA to Checkout

## 13.2 Pro active

Show:

- Pro
- interval
- paid-through/current period end
- subscription status
- cancel-at-period-end state if applicable
- Manage subscription -> Customer Portal

## 13.3 Pending

Show: `Confirming your subscription`

No false success.

Provide refresh/recheck action if appropriate and support/recovery guidance after bounded wait.

## 13.4 Past due / failed

Explain:

- no new paid period was granted
- retained existing paid access only until its legitimate end if applicable
- manage payment method through Portal

## 13.5 Canceling at period end

Show explicit date.

Do not present as already expired.

## 13.6 Expired/revoked

Show:

- Free state
- retained own Notes read/delete policy
- re-subscribe CTA when no current subscription remains

---

# 14. Account

Route: `/app/account`

Title: `Account`

Subtitle: `Manage your account settings.`

## 14.1 Profile

- Name editable
- Save

## 14.2 Email

- current email read-only
- verified status
- copy explaining sensitive email changes use support

## 14.3 Security

- `Reset password` / send recovery link action
- no MFA/SSO controls

## 14.4 Support for sensitive changes

Explain:

- email change
- account deletion

CTA: `Contact support`

Do not implement self-service deletion in V1.

## 14.5 Sign out

Provide in user menu and/or Account.

---

# 15. Help and support

## 15.1 Public `/help`

Must be reachable without authentication.

Content:

- configured support email/contact
- safe instructions for account access issues
- link to documentation
- short FAQ
- never require sign-in merely to discover how to contact support

## 15.2 `/app/help`

Reuse the same core content within the app shell.

Authenticated error/support flows may surface a safe correlation ID.

No chat, ticketing system, analytics, or internal support dashboard.

---

# 16. Data and RLS

## 16.1 Profiles

Recommended:

```text
profiles
  user_id uuid primary key references auth.users
  display_name text
  created_at
  updated_at
```

User:

- may read own profile
- may update allowed own profile fields
- may not mutate identity/billing facts

Profile lifecycle must be safe/idempotent.

## 16.2 Notes

Recommended:

```text
notes
  id uuid primary key
  user_id uuid not null
  title text not null
  body text not null
  created_at timestamptz not null
  updated_at timestamptz not null
```

RLS behavior:

- SELECT: owner only
- DELETE: owner only
- INSERT: owner + current Pro entitlement
- UPDATE: owner + current Pro entitlement
- owner cannot be transferred by client

## 16.3 Financial tables

No `anon` or normal `authenticated` write access.

Prefer no direct client read access unless a minimal projection is intentionally exposed through a safe server path.

## 16.4 Pro check in DB

RLS must enforce Pro write capability even for direct Data API access.

Use a narrowly scoped DB function/policy mechanism.

If using `SECURITY DEFINER`:

- restrict `search_path`
- grant execute only as needed
- return only a boolean/minimal fact
- do not expose financial rows

## 16.5 Types and migrations

Required:

- repeatable migrations from empty
- generated/verified DB types
- safe local/test seed
- no production demo users
- documented type regeneration
- documented migration/rollback/update policy

---

# 17. Auth architecture

Supabase Auth is the sole identity authority for Google OAuth, magic-link login, and email/password with verification/reset. All three use a common session and safe callback/return policy; do not add another auth framework or manually merge accounts by email. Document and test Supabase-supported same-email behavior across methods.

Use server-side auth helpers compatible with App Router.

Requirements:

- secure cookie/session handling
- authorization at sensitive server operations
- protected app routes
- safe handling of expired sessions
- logout result is safe even on provider/session failure
- return-path allowlist

## 17.1 Return-path policy

Only allow internal application paths.

Reject:

- absolute external URLs
- protocol-relative URLs
- encoded external destinations
- javascript/data schemes
- malformed values

Fallback: `/app`

## 17.2 Enumeration safety

Magic-link requests/resends, forgot-password and resend-verification flows should avoid disclosing whether an arbitrary email belongs to an account beyond what Supabase/product constraints require.

## 17.3 Rate/abuse protection

Use:

- Supabase Auth's provider-side limits/configuration
- plus effective application-side protection for exposed app-owned actions where required

Do not use a process-memory-only limiter as the sole control on serverless infrastructure.

---

# 18. Security requirements

Implement and test relevant controls:

- server-side authorization on sensitive actions
- RLS for DB boundary
- Zod/equivalent server validation
- payload size limits
- safe origin/CSRF handling for cookie-based mutations
- effective anti-abuse limits
- Stripe webhook signature verification
- server-only secrets
- no client-writable financial state
- no user-writable owner transfer
- safe error mapping
- correlation IDs without secrets/PII leakage
- security headers compatible with actual journeys
- private routes noindex

Tests must prove behavior, not grep implementation strings.

---

# 19. SEO/publication

Every included public route must have appropriate:

- title
- description
- canonical
- Open Graph
- robots behavior
- sitemap inclusion/exclusion
- semantic HTML
- structured data where truly pertinent

Private routes:

- not in sitemap
- `noindex`

Recommended structured data:

- WebSite / SoftwareApplication on landing where accurate
- FAQPage for actual FAQ content where appropriate

Do not add irrelevant schemas.

## 19.1 Static EXAMPLE page

Route: `/example`

Purpose:

- demonstrate adding a public content page with correct metadata/canonical/navigation/sitemap behavior

Requirements:

- clearly marked as EXAMPLE in code/docs
- removable
- removal procedure tested
- no MDX/blog engine required

---

# 20. Responsive/accessibility

Acceptance viewports:

- 360px
- 768px
- 1280px

Required:

- no accidental horizontal overflow
- keyboard navigable
- visible focus
- proper labels
- useful error associations
- 200% zoom usable
- adequate contrast
- semantic headings/landmarks
- dialogs/sheets manage focus correctly
- mobile nav operable
- automated accessibility scan: zero serious/critical issues on owned routes
- manual sampled screen-reader pass

Financial UI must never show success before trusted confirmation.

---

# 21. Loading, empty, error, and gated states

Every meaningful journey must have explicit states.

## 21.1 Loading

Use skeletons where content shape is known.

Avoid blocking full-screen spinners for ordinary page data.

## 21.2 Empty

Examples:

- fresh Free Notes -> upgrade-oriented empty state
- Pro Notes -> `No notes yet` + New note
- dashboard with no retained notes -> contextual empty state

## 21.3 Error

Errors are concise, actionable, safe, and use a correlation ID when useful.

## 21.4 Premium gated

UI gating is explanatory only.

Security is enforced server/RLS.

---

# 22. Legal routes

Routes:

- `/terms`
- `/privacy`

Design:

- simple public header
- narrow readable content column
- footer

These are templates/placeholders for buyer adaptation, not claims of legal completeness.

Documentation must explicitly tell the buyer to adapt legal/privacy content to their product/jurisdiction.

---

# 23. Canonical configuration

Centralize at minimum:

```text
brand name
site URL
support email
legal URLs
navigation
SEO defaults
currency
Free plan metadata
Pro monthly metadata
Pro annual metadata
Stripe price IDs
feature labels used by reference UI
```

Do not scatter plan IDs/brand copy across components.

Config validation must fail early with actionable safe errors.

Do not log secret values.

---

# 24. Environment variables

`.env.example` must include names and comments but no real secrets.

Categories:

```text
Site
Supabase public
Supabase server/service
Stripe secret
Stripe webhook
Stripe price IDs
Auth email/SMTP-related external configuration notes
Test/staging-only values where needed
```

Document Google OAuth project/consent/credentials and callback URLs per environment, alongside SMTP delivery for verification, reset, and magic links. Distinguish provider-side configuration from app environment values; never expose provider secrets in browser-safe variables. This is configuration guidance for the auth slice, not a change to Phase 0 environment implementation.

Use env validation split correctly between browser-safe and server-only values.

---

# 25. Diagnostics

Deliver a bounded local verification command.

Recommended:

```text
pnpm dnw:verify
```

It should check locally observable facts such as:

- Node/package-manager compatibility
- required env names present
- server/public env separation
- canonical config parses
- expected files/migrations exist
- generated type/schema drift signals where possible
- build/test report presence if configured

Result semantics:

- PASS
- FAIL
- UNKNOWN
- NOT_APPLICABLE

Never report production PASS merely because `.env` exists.

Do not require provider management/admin API credentials for local diagnostics.

---

# 26. Documentation deliverables

At minimum:

```text
README.md
AGENTS.md
.env.example
docs/SETUP.md
docs/ARCHITECTURE.md
docs/BILLING.md
docs/CUSTOMIZATION.md
docs/OPERATIONS.md
```

## 26.1 README

Short:

- what DNW is
- supported stack/model
- quick start
- canonical commands
- links to deeper docs
- clear scope boundaries

## 26.2 AGENTS.md

Canonical agent/human engineering contract:

- source of truth
- architecture map
- invariants
- do-not-break list
- canonical commands
- definition of done
- no tool-specific prompt packs

## 26.3 SETUP

- local
- Supabase
- SMTP/Auth
- Google OAuth project/consent/callback configuration per environment
- magic-link delivery, resend/cooldown, and supported same-email behavior across auth methods
- Stripe test
- Vercel
- callbacks
- webhook
- Portal
- staging/live separation

## 26.4 ARCHITECTURE

- module map
- identity boundary
- RLS boundary
- entitlement boundary
- data flow
- why Notes is EXAMPLE

## 26.5 BILLING

- state policy
- events used
- refund/dispute policy
- reconciliation
- supported/not-supported models
- Stripe Portal configuration

## 26.6 CUSTOMIZATION

Canonical buyer adaptation order:

1. change brand/metadata
2. change design tokens
3. change public copy
4. change catalog/prices
5. replace Notes with product resource
6. change navigation
7. preserve auth/billing/RLS invariants
8. run canonical verification/tests

Include the exercise:

- add one field to Notes
- update migration/types/UI/tests
- prove build/RLS still pass

## 26.7 OPERATIONS

- support procedure for sensitive change/deletion
- billing reconciliation
- incident correlation
- backups/restoration guidance
- update/rollback guidance
- no secret sharing

---

# 27. Testing contract

Use behavior-driven coverage aligned to AC01–AC10.

Recommended command surface:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm test:e2e
pnpm build
pnpm dnw:verify
pnpm dnw:billing:reconcile --dry-run
```

Exact names may adapt to existing repo conventions, but docs must expose one canonical set.

## 27.1 Foundation

Test:

- clean install with lockfile
- env validation
- typecheck
- build
- invalid catalog blocks new purchase safely

## 27.2 Auth

Against hosted staging Supabase, a controlled mailbox, and Google test/staging credentials:

- Google OAuth signup/login, cancellation, and failure
- magic-link signup/login, resend, and cooldown
- email/password signup
- verification
- resend
- login
- forgot/reset
- expired/reused link
- expired session
- safe return path
- invalid callback and external return rejection across methods
- same-email behavior across methods without cross-account access or unsafe manual linking
- logout
- safe logout failure
- edit name

## 27.3 RLS

Users A, B, anon.

Prove:

- A cannot read/update/delete B
- anon cannot read
- owner cannot change owner
- user cannot write financial state
- Free cannot insert/update Notes
- Pro can insert/update own Notes
- downgraded user can read/delete own Notes but not update

Run against real DB/Data API, not only service-role.

## 27.4 Stripe

Test mode:

- monthly signup
- annual signup
- close browser before return
- payment confirmation
- renewal
- payment failure
- cancel at period end
- immediate cancellation
- re-subscribe when allowed
- full refund
- partial/old refund
- dispute open/lost/won
- unsupported price
- double attempt
- own Portal only

## 27.5 Webhook/recovery

Prove:

- invalid signature rejected
- duplicate event has one effect
- concurrent duplicate converges
- reverse event order converges
- DB/API temporary failure remains recoverable
- reconciliation repairs small fixture
- browser return not needed

## 27.6 UI

E2E:

- 360
- 768
- 1280
- keyboard
- focus
- zoom
- automated a11y
- error states
- no false financial success

## 27.7 SEO

Prove:

- public pricing matches configured catalog/Checkout
- canonical/OG/robots/sitemap correct
- private routes noindex
- EXAMPLE page removable without breaking build/SEO/navigation

## 27.8 Package/release

Prove:

- tag and ZIP buyer content equivalent
- both install/build/test with canonical commands
- no secrets in package/logs
- essential scripts included

---

# 28. Release gates

All gates are mandatory.

## G1 — Reproducible package

Pass:

- clean install
- typecheck
- build
- commands present
- tag/ZIP equivalent
- no secrets

## G2 — Account and data

Pass:

- real hosted Google OAuth, magic-link, and email/password flows
- DB A/B/anon real
- verification/reset
- RLS
- Pro write / Free deny
- support-sensitive-change procedure rehearsed

## G3 — Money and recovery

Pass:

- Stripe test mode
- monthly/annual
- browser closed
- renewal/failure/cancel/refund/dispute
- signature/duplicate/order/failure
- reconciliation
- own Portal

## G4 — Product and publication

Pass:

- same deployed SHA
- 360/768/1280
- a11y
- error states
- pricing
- SEO
- removable EXAMPLE page

## G5 — Operability and modification

Pass:

- honest local diagnostics
- remote functional checklist
- support/runbook
- incident recovery
- restore sample
- Notes adaptation exercise

## G6 — Security and claims

Pass:

- negative security tests
- G1–G5 evidence complete
- no P2 needed to pass
- docs/marketing match actual perimeter

No UNKNOWN applicable evidence at release close.

---

# 29. Implementation sequence

Do not attempt the whole product in one prompt.

## Phase 0 — Repository audit + foundation

Deliver:

- actual repo inventory
- actual current state
- chosen stable versions
- package manager/lockfile decision
- TypeScript strict
- Tailwind/primitives
- fonts/tokens
- env/config validation
- test harness
- route-group skeleton
- Supabase clients
- build/lint/typecheck green

No product feature expansion.

## Phase 1 — Database + auth

Deliver:

- migrations
- profiles
- auth UI
- Google OAuth signup/login
- magic-link signup/login with sent/resend/cooldown states
- signup/verify/resend/login
- forgot/reset
- session/logout
- safe callbacks
- name update
- auth tests

## Phase 2 — Billing core

Deliver:

- catalog
- customer mapping
- Checkout
- webhook signature + ledger
- subscription projection
- paid entitlement facts
- Portal
- refund/dispute policy
- reconciliation command
- Stripe behavior tests

## Phase 3 — RLS + Notes entitlement

Deliver:

- Notes migration
- policies
- Pro-write DB function/policy
- direct API A/B/anon tests
- Free/Pro/downgrade behavior

## Phase 4 — App shell and product UI

Deliver:

- Dashboard
- Notes
- Billing
- Account
- Help
- responsive nav
- loading/empty/error/gated states

## Phase 5 — Marketing/publication

Deliver:

- landing
- terms
- privacy
- public help
- static EXAMPLE
- SEO/sitemap/robots/OG/structured data

## Phase 6 — Verification/docs/release

Deliver:

- diagnostics
- docs
- customization exercise
- packaging
- staging evidence
- G1–G6 closeout

---

# 30. Per-slice Definition of Done

A slice is not done until:

1. implementation is scoped to this contract
2. no unrelated feature/dependency was added
3. server-side authorization is correct
4. RLS/security implications are addressed
5. loading/error/empty states are handled where applicable
6. responsive behavior is handled where applicable
7. relevant tests pass
8. lint/typecheck pass
9. build passes when runtime/build changed
10. docs/config are updated if behavior/config changed
11. agent reports changed files, commands run, results, and unresolved issues

---

# 31. Codex prompt footer

Append this to every implementation prompt:

> Treat `docs/product/V1_SCOPE.md` as the immutable product contract and `BUILD_SPEC.md` as the implementation contract. If they conflict, stop and report the conflict; `V1_SCOPE.md` wins. Do not add functionality outside the supplied slice. Do not add abstractions, dependencies, routes, providers, or product features unless required by the contract. Never weaken auth, RLS, billing, or evidence requirements to make a test pass. Before finishing, run the relevant lint, typecheck, tests, and build. Report exactly what changed, which commands were executed, their results, and every unresolved issue.

---

# 32. Explicit anti-scope checklist

Before merge/release verify absence of:

- OAuth providers other than Google
- MFA / SSO
- teams
- organizations
- workspaces
- seats
- RBAC
- trials
- promotions
- active interval switching
- lifetime/one-time billing
- usage billing
- credits
- blog engine
- CMS
- native leads
- analytics SDK/dashboard
- chat
- application email framework
- Storage product feature
- Realtime product feature
- dark mode
- theme selector
- multiple payment providers
- multiple auth frameworks
- alternate deployment targets
- rich-text Notes editor
- fake dashboard analytics
- dormant P2 flags/code

---

# 33. Final product promise

The release should allow a buyer to:

1. clone/install reproducibly
2. configure one supported stack
3. create/verify/recover an account
4. deploy private user-owned data protected by RLS
5. sell one Pro subscription monthly or annual
6. receive/lose Pro access correctly without depending on browser return
7. recover billing drift through a bounded repeatable procedure
8. navigate a polished responsive public/auth/app/account/billing/help experience
9. replace Notes with their own product resource
10. understand exactly what must not be broken while adapting the starter

That is the target.

Anything that does not materially help those ten outcomes should be questioned before it is added.
