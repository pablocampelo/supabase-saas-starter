# Phase 0 setup

1. Use Node 24.x (24.19.0 tested) and pnpm 11.19.0. `packageManager`, engines and `.node-version` record the selected matrix. pnpm 12 is available; this slice uses the installed stable 11.19 toolchain rather than introducing a package-manager migration.
2. Run `pnpm install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local`. Set the site origin, Supabase project URL, its **publishable** key, and support email. Local HTTP is allowed only on loopback. Hosted URLs require HTTPS. No secrets belong in `NEXT_PUBLIC_*` variables. Public variables are frozen at build time.
4. Run `pnpm dev`. Only `/` exists, as an explicitly unfinished foundation preview.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. `typecheck` first generates Next route types and requires the same env configuration as the app. Missing/invalid required values stop dev/build/start with field names, never supplied values.
6. Run `pnpm exec playwright install chromium`, then `pnpm test:e2e`. The browser smoke harness starts its own server at 127.0.0.1:3100 with synthetic public configuration, not provider credentials. It does not contact Supabase or Stripe.

The preview needs no server secret. Optional future credentials are validated when provided; blank values mean unconfigured. The catalog intentionally has no default paid prices: `getPurchasableCatalog()` throws until both distinct IDs and positive integer minor-unit amounts exist. Shape validation does not verify Stripe availability, currency, or actual amounts; Phase 2 must verify those against Stripe before purchasing. There is no purchase endpoint in Phase 0.

For a local build-only check without provider setup, set the three public variables to `http://localhost:3000`, `http://127.0.0.1:54321`, and `sb_publishable_local_test_fixture`, and SUPPORT_EMAIL to `support@example.com` in the command environment. These values are synthetic, not operational credentials. A passing build does not establish provider connectivity or satisfy release gates.

Phase 1 must configure Supabase email/password, confirmation, custom SMTP, sender/domain, allowed callback URLs and session-refresh proxy before exposing protected pages. SMTP secrets live in Supabase, not this app. Hosted recovery/mailbox, DB/RLS and security evidence remain pending. Phase 2 adds Stripe test-mode setup, webhook, customer Portal, and privileged recovery. Configure staging and production independently; never run destructive fixtures against production.

Vercel is the supported eventual deployment target. Use Node 24 and pnpm's locked install/build, configure environment values per deployment, and rebuild when public values change. No deployment or remote resources were created by Phase 0. Full deployment, billing, customization and operations runbooks belong to the relevant later slices.
