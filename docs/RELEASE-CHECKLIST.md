# Xerv release checklist

Xerv is an MIT-licensed source repository, not a managed SaaS. Each deployment must be configured independently.

## Repository and distribution

- [ ] The README, package metadata, brand config, GitHub About/description and repository topics consistently say Xerv.
- [ ] The generated Open Graph card at /opengraph-image renders the current brand and responds with image/png.
- [ ] Check every public link and verify the live demo is accessible without team SSO or a Vercel login.
- [ ] Check CI for the exact release commit: frozen install, lint, typecheck, unit tests, build, SQL/RLS database tests, and browser E2E.
- [ ] Confirm no API secrets, personal tokens or real customer records are committed.

## Hosted provider setup

- [ ] Configure distinct Supabase, Stripe, Google OAuth, SMTP/Resend and Vercel resources for test and production.
- [ ] Set NEXT_PUBLIC_SITE_URL to the exact public canonical origin (HTTPS, no trailing slash/path).
- [ ] In Supabase Authentication → URL Configuration, use that same Site URL and allow /auth/callback and /auth/confirm on that origin.
- [ ] In Supabase Authentication → Email Templates, install both committed HTML templates from supabase/templates/. Local files do not update hosted Supabase automatically.
- [ ] Configure Google's authorized OAuth callback as https://<project-ref>.supabase.co/auth/v1/callback (the Supabase endpoint).
- [ ] Keep Vercel previews protected while making the intended production domain publicly reachable.
- [ ] Apply database migrations deliberately and configure a signed, environment-specific Stripe webhook.

## Smoke-test using fresh email links

- [ ] New email/password signup → delivered verification email → /auth/confirm → authenticated /app (no 404).
- [ ] Forgot password → delivered recovery email → /auth/confirm → /reset-password → sign in with new password.
- [ ] Google OAuth works from sign-in to /auth/callback and preserves the session.
- [ ] Stripe test-mode Checkout, paid invoice webhook, Pro entitlement and Customer Portal work end-to-end.
- [ ] Production support contact, legal templates, sitemap, mobile layouts and Open Graph card have been reviewed.

If an email link returns 404, inspect its actual hostname and path: compare Vercel production domain, Supabase Site URL, allowed redirects and the installed hosted email template. Changing application code alone does not fix hosted Auth configuration. See [Setup](SETUP.md#auth-url-configuration).
