# Current setup

`docs/product/SCOPE.md` defines the final supported product. This document describes the setup required by the repository as it exists now and calls out provider setup that remains deployment-owned.

## Local foundation

Local application development uses a local Supabase stack and Mailpit. It does **not** require Resend, DNS, a hosted Supabase project or a public domain.

Prerequisites:

- Node and pnpm versions committed by the repository (currently Node 24.x and pnpm 11.19.0);
- Docker Desktop or another Docker-compatible runtime running locally.

Install dependencies and start the pinned Supabase CLI stack:

```sh
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
```

The repository pins Supabase CLI `2.118.0` in the package scripts via `pnpm dlx`; it is not added to application runtime dependencies.

`pnpm supabase:status` prints the local API URL and browser-safe publishable key. Copy `.env.example` to `.env.local` and use the local values:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key printed by pnpm supabase:status>
SUPPORT_EMAIL=support@example.com
```

Then start Next.js:

```sh
pnpm dev
```

Local service defaults committed in `supabase/config.toml`:

- Supabase API: `http://127.0.0.1:54321`;
- Postgres: port `54322`;
- Supabase Studio: `http://127.0.0.1:54323`;
- Mailpit: `http://127.0.0.1:54324`.

Machine-specific port workarounds may be used locally when an operating system reserves those defaults, but they are not starter requirements and must not replace the committed canonical ports.

The local Auth configuration enables email confirmations and uses the committed `supabase/templates/confirmation.html` and `supabase/templates/recovery.html` templates. These use the same `TokenHash -> /auth/confirm -> verifyOtp()` SSR/PKCE path required by hosted Auth. `http://localhost:3000/**` is allowed only in the local configuration; do not copy that wildcard to production.

To exercise the local email/password journey:

1. Open `http://localhost:3000/signup` and create a user.
2. Open Mailpit at `http://127.0.0.1:54324`.
3. Open the confirmation email and follow its link; it should pass through `/auth/confirm` and land in the private app.
4. Sign out.
5. Request password recovery from the login/recovery UI.
6. Open the recovery message in Mailpit and follow its link; it should pass through `/auth/confirm?type=recovery` and open `/reset-password` with a recovery session.
7. Set a new password and sign in normally.
8. Exercise resend verification with a fresh unconfirmed account if needed.

No email leaves the machine in this workflow. Stop the stack with:

```sh
pnpm supabase:stop
```

## Database, RLS and generated types

The committed SQL migrations are the schema authority. They currently create:

- `public.billing_projection`, a server-owned reconstructible billing projection;
- the current-user Pro entitlement boundary (`private.has_pro()` plus the authenticated RPC wrapper);
- `public.example_resources`, including ownership defaults, constraints, immutable-owner enforcement, indexes and RLS.

The Example policies implement the product contract directly in Postgres:

- anonymous access denied;
- authenticated users can read/delete only their own resources;
- create/update require ownership plus a current Pro entitlement;
- owner transfer is rejected;
- authenticated clients have no direct read/write grants on the billing projection.

Rebuild and verify the local database with:

```sh
pnpm supabase:db:reset
pnpm supabase:test:db
```

`pnpm supabase:db:reset` is destructive to the **local** database: it recreates the database from committed migrations. Do not run it against a hosted project and do not use it when local data must be preserved.

The pgTAP suite under `supabase/tests/database/` exercises two authenticated identities, anonymous denial, ownership isolation, immutable owner, financial-write denial, Free/Pro/revoked transitions, premium-write gating and retained read/delete semantics.

Regenerate TypeScript types from the local schema with:

```sh
pnpm supabase:types
```

The generator writes `lib/supabase/database.types.ts` explicitly as UTF-8 so generation is stable across shells, including Windows PowerShell. Generated types are derived artifacts; migrations remain the authority.

## Application checks

Run the application checks separately:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser regression suite uses synthetic public configuration and an `E2E_AUTH_BYPASS` flag injected only by Playwright. The bypass is ignored in production and is not an application authentication mechanism. Local browser checks, Mailpit flows and local RLS tests do not certify deployer-owned hosted SMTP, Google OAuth, Stripe or Vercel configuration.

## Safe local build fixture

For a build-only check without starting the local Supabase stack, tests may use synthetic values such as:

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
- `E2E_AUTH_BYPASS` is test-only, is set by Playwright, and must never be treated as an operational setting.

## Provider ownership

DaysNotWeeks integrates external providers but does not proxy or resell them. Each deployed product owns and configures its own:

- Supabase project;
- Resend account and sending domain;
- Stripe account;
- provider credentials and DNS.

Do not use a DaysNotWeeks-owned sending domain, SMTP credential or provider account in a customer deployment. This keeps deliverability, billing, abuse controls, secret ownership and operational recovery isolated to the deployed product.

## Supabase Auth

The application implements exactly the Scope 2.0 authentication surface:

- Google OAuth;
- email/password signup and sign-in;
- email verification and resend;
- forgot/reset password;
- cookie-backed SSR sessions and logout;
- protected `/app` routes with safe internal return paths.

Magic-link authentication is OUT.

### Redirect URLs

Configure hosted Supabase Auth so each environment allows only the application URLs it actually needs. The application uses:

- `/auth/callback` for Google OAuth PKCE exchange;
- `/auth/confirm` for email confirmation and recovery token exchange;
- private `/app` destinations as validated post-auth return paths.

Keep local, staging and production origins isolated. A broad `http://localhost:3000/**` wildcard is committed only for local development; use exact deployed URLs in production wherever practical.

### Auth email / SMTP

Hosted authentication email is sent by **Supabase Auth through the deployer's own Resend SMTP configuration**. The Next.js application does not use the Resend SDK merely to deliver Auth email, and Resend SMTP credentials do not belong in `.env.local` or any `NEXT_PUBLIC_*` variable.

Recommended production boundary:

- use a dedicated Auth sending domain such as `auth.example.com`;
- use a sender such as `no-reply@auth.example.com`;
- keep Auth email separate from marketing email reputation;
- verify the sending domain in Resend with the DNS records Resend supplies;
- disable click/open tracking for Auth email so provider link rewriting cannot interfere with verification/recovery links;
- keep staging/test and production sending identities isolated when practical.

Resend SMTP settings for Supabase:

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: <customer-owned Resend API key>
Sender email: no-reply@auth.example.com
Sender name: <product name>
```

Configure these values in the Supabase project's **Authentication → Emails → SMTP Settings** (or equivalent current Auth SMTP configuration). The SMTP password is provider configuration owned by Supabase/Resend, not an application runtime secret.

For hosted projects, configure custom SMTP before relying on production email delivery or hosted email-template customization. Supabase's default email provider is for limited testing and may impose delivery/template restrictions.

Local Supabase development uses Mailpit instead of hosted SMTP credentials.

### Confirm signup template

The local template is committed at `supabase/templates/confirmation.html`. For hosted Supabase, configure the **Confirm signup** template with the same token-hash link:

```html
<h2>Confirm your email address</h2>
<p>Follow the link below to confirm this email address and finish signing up.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
    Confirm email address
  </a>
</p>
```

The application validates the resulting return destination against the same-origin `/app` allowlist before redirecting.

### Password recovery template

The local template is committed at `supabase/templates/recovery.html`. Configure the hosted Supabase **Reset password** template with the same recovery flow:

```html
<h2>Reset your password</h2>
<p>We received a request to reset your password. Follow the link below to choose a new one.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
    Reset password
  </a>
</p>
```

`resetPasswordForEmail` supplies the original validated private destination as `.RedirectTo`. The confirmation route validates it again, establishes the recovery session, and then opens `/reset-password?next=...`. After a successful password update, the application signs out the recovery session and sends the user back through normal sign-in while preserving that safe destination.

### Google OAuth

Enable only Google for the supported OAuth surface. Configure the Google project, consent screen and Supabase callback values independently for staging and production. The application starts OAuth at `/auth/google` and exchanges the returned authorization code at `/auth/callback`.

Google OAuth is not enabled in the committed local Supabase configuration because it requires deployer-owned OAuth credentials. Email/password Auth is fully testable locally without Google.

### Hosted Auth verification

Before release, verify on the deployed candidate SHA:

- Google signup/sign-in and callback;
- email/password signup;
- confirmation email and resend;
- invalid/expired confirmation behavior;
- forgot/reset password, preserved safe return path, and reused/expired recovery links;
- logout and session refresh;
- unauthenticated `/app` redirect plus safe `next` handling;
- Account display-name update;
- support behavior for sensitive account changes.

Hosted Auth was exercised during starter implementation, but release evidence remains environment-specific. Do not hard-code a DaysNotWeeks domain or SMTP account into the starter merely to make these checks pass.

## Current billing-config gap

`.env.example` currently contains `PRO_MONTHLY_AMOUNT` and `PRO_ANNUAL_AMOUNT` from the Phase 0 catalog foundation. They are not the final Scope 2.0 authority for price amounts.

When billing is implemented, Stripe Price must become authoritative for amount, currency and recurrence, while configured Price IDs identify the supported monthly/annual options. Do not extend new behavior around the legacy amount variables.

## Stripe setup — required by Scope 2.0, not implemented yet

The final supported billing path is Stripe Checkout + Customer Portal + signed webhooks + a local reconstructible Pro projection.

Staging/test and production/live must be configured separately. The implementation must verify the configured monthly/annual Price IDs server-side, derive monetary facts from Stripe, and never grant Pro from the browser success redirect.

Billing setup is incomplete until webhook behavior, paid-through semantics, durable Checkout attempts, concurrency handling and reconciliation are implemented and tested.

## Deployment

Vercel is the only supported deployment target.

The final release path must keep local, staging and production isolated; apply database migrations through a controlled process rather than every preview deploy; and verify hosted Google OAuth, SMTP, Stripe webhook behavior and the deployed SHA before release.

Until all release gates are verified, do not describe the starter as fully production-ready.
