# Current setup

`docs/product/SCOPE.md` defines the final supported product. This document describes the setup required by the repository as it exists now and calls out provider setup that still requires hosted verification.

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

The browser regression suite uses synthetic public configuration and an `E2E_AUTH_BYPASS` flag injected only by Playwright. The bypass is ignored in production and is not an application authentication mechanism. Local browser checks do not certify hosted Supabase Auth, SMTP, Google OAuth, Stripe or Vercel behavior.

## Safe local build fixture

For a build-only check without remote provider setup, tests may use synthetic values such as:

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

Configure Supabase Auth so each environment allows the application origin and these server endpoints:

- `/auth/callback` for Google OAuth PKCE exchange;
- `/auth/confirm` for email confirmation and recovery token exchange.

Keep local, staging and production origins isolated. Do not add wildcard production redirects broader than the deployed application requires.

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

Local Supabase development should use the Supabase mail catcher rather than hosted SMTP credentials.

### Confirm signup template

After custom SMTP is configured, set the Supabase **Confirm signup** template to send the token hash to the application confirmation route:

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

Set the Supabase **Reset password** template to establish the recovery session through `/auth/confirm` before rendering the password form:

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

Hosted release evidence belongs to the deployer's provider configuration. Do not hard-code a DaysNotWeeks domain or SMTP account into the starter merely to make these checks pass.

## Current billing-config gap

`.env.example` currently contains `PRO_MONTHLY_AMOUNT` and `PRO_ANNUAL_AMOUNT` from the Phase 0 catalog foundation. They are not the final Scope 2.0 authority for price amounts.

When billing is implemented, Stripe Price must become authoritative for amount, currency and recurrence, while configured Price IDs identify the supported monthly/annual options. Do not extend new behavior around the legacy amount variables.

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

Until all release gates are verified, do not describe the starter as fully production-ready.
