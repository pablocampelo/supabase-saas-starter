# Setup and deployment

This is the supported **buyer-owned** path from a fresh clone to a deployed SaaS. Supabase SaaS Starter is a **repository**, not a managed hosting, email or billing service. Its verified code does not validate a buyer's credentials or DNS.

**Supported versions:** use the Node, pnpm, dependencies and Supabase CLI pinned in `package.json`, `.node-version` and the lockfile (currently Node 24, pnpm 11.19.0 and Supabase CLI 2.118.0).

## 1. Local development

**Prerequisites:** Node.js 24, pnpm 11.19.0, Docker running.

```sh
git clone <your-repository-url> my-saas
cd my-saas
pnpm install --frozen-lockfile
pnpm supabase:start
pnpm supabase:status
```

Copy `.env.example` to `.env.local` and configure:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from pnpm supabase:status>
SUPPORT_EMAIL=support@example.com
SUPABASE_SECRET_KEY=<local service-role JWT from pnpm supabase:status>
```

The privileged `SUPABASE_SECRET_KEY` is needed for billing server operations; **never** expose it in `NEXT_PUBLIC_*`. Hosted Supabase uses its `sb_secret_` key instead of the local service-role JWT.

Initialize/verify the local schema and launch:

```sh
pnpm supabase:db:reset
pnpm dev
```

Open **http://localhost:3000**. Supabase Studio is **http://127.0.0.1:54323**; local Auth email is captured by Mailpit at **http://127.0.0.1:54324**. Local Auth does **not** require Google credentials, Resend, DNS or hosted Supabase.

The local stack includes committed **confirm-signup and password-recovery templates**. Verify email/password signup, confirmation, sign-in, sign-out and password reset using the links in Mailpit. The recovery link must reach `/auth/confirm?type=recovery` and then `/reset-password`.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm supabase:test:db
pnpm supabase:types
pnpm exec playwright install chromium
pnpm test:e2e
```

Run `pnpm supabase:db:reset` before DB tests whenever you need a clean local schema. **It destroys local DB data; never run it against a hosted database.** Generated types should match `lib/supabase/database.types.ts` without a diff. Stop the local stack with `pnpm supabase:stop`.

The browser suite includes a strictly non-production presentation-only bypass. It cannot grant real users access and is not a substitute for provider-level Auth testing.

## 2. Product identity and code

In `config/product.ts`, change the product name, public/private navigation, currency, pricing descriptions and feature copy. Edit the landing, Help and legal templates for your real product. The Terms and Privacy pages contain explicit placeholders; **do not publish them as finished policies**.

The Example Resource exists only to demonstrate isolation and billing gates. Replace it as described in [Architecture → Replacing the Example Resource](ARCHITECTURE.md#replacing-the-example-resource), preserving SQL migrations, RLS, immutable ownership and current-user `has_pro()`. Auth and Billing must not depend on your product-specific resource.

## 3. Hosted Supabase and database

1. Create a buyer-owned **Supabase project** per environment. Do not reuse a production project for disposable QA.
2. Configure the application environment with your project's **URL**, `sb_publishable_` key and **server-only** `sb_secret_` key.
3. Apply all committed migrations to a **clean test project first**. Verify generated types, RLS/privileges and migrations before changing a live database.
4. Apply hosted migrations as an explicit operator step (for example, with the pinned Supabase CLI):

```sh
pnpm dlx supabase@2.118.0 login
pnpm dlx supabase@2.118.0 link --project-ref <your-project-ref>
pnpm dlx supabase@2.118.0 db push
```

Check the CLI's target project before applying changes. These commands operate on a hosted project once linked. **Never run a local DB reset against hosted data.** Do not run hosted migrations automatically in every Vercel preview deployment. Database rollback requires its own plan; rolling back the application does not revert Postgres.

### Auth URL configuration

In Supabase **Authentication → URL Configuration**, use **one canonical application origin** for the environment:

```text
Site URL: https://your-app.example.com

Redirect URLs:
https://your-app.example.com/auth/callback
https://your-app.example.com/auth/confirm
https://your-app.example.com/**
```

Use exact URLs or the narrowest wildcard needed by your Auth journeys. Keep localhost allowances **local only**. The application defaults to `/app` after Auth and rejects unsafe external private redirects.

**Crucial:** Set `NEXT_PUBLIC_SITE_URL` to that **same canonical origin** in Vercel. Stripe Checkout and Customer Portal use it for their browser returns. Using a different Vercel/team alias can lose the session cookie and send a paid user to Sign in, even while their subscription is correctly paid.

### Google OAuth

1. Create an OAuth **Web application** client in Google Cloud, and configure the consent screen/test users as appropriate.
2. Google's **Authorized redirect URI** is the **Supabase provider callback**, *not* the Next.js app callback:

```text
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```

3. In Supabase **Authentication → Providers → Google**, enable Google and enter the buyer-owned Client ID/Secret. These values do **not** belong in the application's browser env.
4. Test **Continue with Google** from the deployed app: consent must complete, `/auth/callback` must exchange the PKCE code, and the browser must reach an authenticated `/app`.

### Email confirmations, recovery and SMTP

For hosted Auth email, use **Supabase Auth → Resend SMTP**, not an application email integration. Verify the sending domain and its DNS records in Resend, then configure in Supabase **Authentication → SMTP Settings**:

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: <your Resend sending API key>
Sender email: no-reply@<your verified domain>
Sender name: <your product name>
```

Use the email sender/domain you actually verified. Keep sender identity and credentials environment-owned; avoid click/link rewriting on Auth mail. A working SMTP connection alone **does not** configure the hosted email templates.

In Supabase **Authentication → Email Templates**, replace the default templates with the committed versions in `supabase/templates/`. **Do not use the default `{{ .ConfirmationURL }}` link** if the starter's cookie-backed token-hash exchange is required.

**Confirm signup** (body/link from `supabase/templates/confirmation.html`):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
  Confirm email address
</a>
```

**Reset password** (body/link from `supabase/templates/recovery.html`):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
  Reset password
</a>
```

These are **hosted provider settings**: committing local template files does not automatically install them in Supabase. After saving, request fresh emails; previously sent links do not change. Confirm that the browser reaches `/app` after signup and `/reset-password` after recovery. An email that sends you to the public landing page instead of the reset form is often still using the **default Supabase verification link**.

## 4. Stripe test mode

Create one Stripe product with **two recurring Prices** in the same configured currency: monthly and annual. Stripe Price is authoritative for amount/interval; no hard-coded duplicate amounts are required in the app.

Set these **server-only** variables:

```dotenv
STRIPE_SECRET_KEY=<test secret key, sk_test_...>
STRIPE_WEBHOOK_SECRET=<signing secret for this exact webhook endpoint>
STRIPE_PRO_MONTHLY_PRICE_ID=<monthly Price ID>
STRIPE_PRO_ANNUAL_PRICE_ID=<annual Price ID>
```

Never mix Stripe test/live keys, Price IDs and signing secrets. Checkout passes selected server-owned Price IDs; the browser cannot change the financial mapping. Billing is gated by **confirmed paid invoice periods**, not a Checkout success redirect.

For local webhook testing, run the app and the Stripe CLI listener in separate terminals:

```sh
stripe listen --events checkout.session.completed,checkout.session.expired,invoice.paid,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,charge.refunded,charge.dispute.created,charge.dispute.updated,charge.dispute.closed --forward-to http://127.0.0.1:3000/api/stripe/webhook
```

Use the listener's **current** `whsec_` signing secret as `STRIPE_WEBHOOK_SECRET` locally and restart Next.js after changing environment values.

For a hosted environment, register **HTTPS `https://your-app.example.com/api/stripe/webhook`** in Stripe test mode with the same supported event set and use *that endpoint's* separate signing secret in Vercel. A local CLI secret does not validate a hosted webhook signature.

Verify monthly and annual Checkout, payment confirmation, cancellation, renewal and failure in **Stripe test mode**. A browser may close before the webhook; access must still converge through trusted Stripe facts. Inspect Billing and the DB projection, not just the success page. Customer Portal must open only for the authenticated owner's customer ID.

The [Billing](BILLING.md) covers duplicate/reordered events, refunds/disputes and manual reconciliation. **No automatic reconciliation cron or guaranteed recovery time is included.**

## 5. Deploy to Vercel

1. Push your adapted repository to your Git provider and import it into a buyer-owned **Vercel** project.
2. Use the supported **Node 24** baseline and the committed `pnpm-lock.yaml` for installation/build.
3. Set `NEXT_PUBLIC_SITE_URL`, the Supabase URL/publishable key, support email, Supabase server secret and Stripe server keys/Price IDs in the correct Vercel environments. Browser-exposed variables must contain **no secrets**.
4. Configure hosted Google OAuth, verified Auth SMTP/templates and Stripe webhook for the final domain **before** promoting the site.
5. Apply controlled hosted SQL migrations **before** deploying incompatible application changes.
6. Build/deploy and smoke the actual deployed SHA.

Keep preview/staging/test credentials isolated from live production; changing an environment variable requires a **new deployment** for the updated build/runtime config.

### Hosted go-live verification

Before accepting a deployment as ready, exercise:
- Fresh password signup → delivered confirmation link → authenticated Dashboard; resend and invalid/expired callback behaviors.
- Google OAuth consent → authenticated Dashboard; logout and return paths.
- Forgot password → delivered recovery email → password change → new login.
- Anonymous/private navigation, A/B isolation, Pro-only create/edit, retained read/delete after downgrade.
- Monthly and annual test Checkout, remote signed webhook `invoice.paid`, Pro entitlement, browser-close safety, duplicate/concurrent safety, Portal, renewal/failure/cancellation.
- Correct canonical return origin, SEO metadata, private noindex, keyboard/focus and responsive layouts.
- Legal content, support contact, secrets and production/live provider separation.

Treat the repository CI as implementation verification, not as a substitute for buyer-owned hosted QA.

## 6. Operation and maintenance

```sh
pnpm billing:reconcile                # dry-run, all known accounts
pnpm billing:reconcile -- --user <supabase-user-uuid>
pnpm billing:reconcile -- --apply      # explicit financial repair, after review
```

Always confirm the target Supabase and Stripe environments before applying reconciliation. Logs and output must never expose credentials or sensitive tokens. If Stripe exhausts its webhook retries, an operator may need to reconcile; the starter does not run a scheduler by default.

Maintain framework/provider compatibility, security updates and regressions without adding unrelated infrastructure. See [Architecture](ARCHITECTURE.md), [Billing](BILLING.md) and the [README scope](../README.md#scope) for the supported boundaries.
