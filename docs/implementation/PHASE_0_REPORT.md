# Phase 0 — repository audit and foundation

Date: 2026-09-24. Starting HEAD: `efc0152e5e68e46f81a947f2b9d4ccf413c1e54e`.

## Audit before edits

The working tree was clean and greenfield. The only files were `BUILD_SPEC.md`, `docs/product/V1_SCOPE.md`, and `docs/implementation/CODEX_PHASE_0_PROMPT.md`. There was no package manager/lockfile, Next/React/TypeScript version, App Router structure, auth, Supabase integration, Stripe integration, database/migrations, test/lint/typecheck/build tooling, design-system library, env file or repository/ancestor AGENTS guidance. No legacy/P2 implementation required cleanup. Historical baseline claims in the scope were not treated as this repository's state.

Both contracts were read completely before editing. No Phase 0 conflict was found. Neither original contract nor the supplied prompt was modified.

## Decisions and version evidence

Versions were resolved from the public npm registry's metadata and peer constraints on the implementation date, not selected from memory. Exact direct versions and transitive integrity hashes are in `package.json` and `pnpm-lock.yaml`.

| Area | Selected | Reason |
| --- | --- | --- |
| Runtime | Node 24.x, tested 24.19.0 | Installed runtime; satisfies Next, Supabase and Vitest engines |
| Package manager | pnpm 11.19.0 | Greenfield contract requires pnpm; current installed stable major retained. Registry latest is 12.6.0 |
| Framework | Next 16.3.6, React/React DOM 19.3.0 | Registry stable releases with compatible framework peer range |
| Types | TypeScript 6.0.3, Node types 24.13.6, React types 19.3.0 | TypeScript 7.0.2 is newer but typescript-eslint 8.70.1 requires TypeScript <6.1 |
| Styling | Tailwind/PostCSS 4.3.3 | One semantic light-theme system |
| Primitive | Radix Slot 1.3.3 | Minimal shadcn-compatible owned button, no gallery |
| Validation | Zod 4.6.5 | Shared safe validation with separate env readers |
| Supabase | JS 2.117.1, SSR 0.12.7 | Official packages; SSR requires JS ^2.114.0 |
| Lint | ESLint 9.39.5, eslint-config-next 16.3.6 | Current transitive React/import/a11y plugins reject ESLint 10 |
| Tests | Vitest 5.0.1, Playwright 1.63.0, axe Playwright 4.13.0 | Unit behavior and minimal browser/a11y harness |
| Fonts/icons | Fontsource Inter/Funnel Sans 5.3.0, Lucide 1.48.0 | Required typography/icons; local pinned fonts make builds independent of Google Fonts |

Official references checked: [Next installation](https://nextjs.org/docs/app/getting-started/installation), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Supabase changelog](https://supabase.com/changelog), and [shadcn button](https://ui.shadcn.com/docs/components/button). The changelog flags Node 20 support removal; the selected Node 24 avoids it. Hosted SMTP and other auth changes must be handled in Phase 1.

All dependencies are newly added because the repository had none. Supporting packages are `class-variance-authority`, `clsx`, `tailwind-merge` for the owned primitive and `server-only` for build-enforced boundaries. No dependency was removed from the initial repository. ESLint 10 was tried and replaced during implementation because of peer incompatibility. The official Stripe SDK is deferred until Phase 2 has a consumer; no unused billing runtime is installed.

## Changed files

- Toolchain: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.node-version`, `.gitignore`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`.
- UI: `app/layout.tsx`, `app/globals.css`, `app/(marketing)/page.tsx`, `components/ui/button.tsx`, `lib/utils.ts`.
- Configuration: `.env.example`, `config/product.ts`, `config/site.ts`, `config/catalog.ts`, `config/catalog-schema.ts`, and `lib/env/{validation,public-schema,public,server-schema,server}.ts`.
- Supabase: `lib/supabase/client.ts`, `lib/supabase/server.ts`.
- Verification: `vitest.config.ts`, `playwright.config.ts`, `tests/fixtures/env.ts`, `tests/unit/{env,catalog,supabase}.test.ts`, `tests/unit/server-only.ts`, `tests/e2e/foundation.spec.ts`.
- Documentation: `AGENTS.md`, `README.md`, `docs/SETUP.md`, `docs/ARCHITECTURE.md`, and this report.

The only route is `/`, inside a marketing route group. It explicitly describes its unfinished state and is noindex. No empty private route groups or fake dashboard were added. Configuration includes brand/site/support/SEO/navigation/legal placeholders and a Free/Pro catalog shape; missing prices fail closed. Public environment reads are allowlisted, privileged modules use `server-only`, and validation never includes supplied values in error messages.

## Verification results

Commands use synthetic public fixture values for build/typecheck; no real service credentials or remote state are used. `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_test_fixture`, `SUPPORT_EMAIL=support@example.com`. Build canaries were `SUPABASE_SECRET_KEY=sb_secret_server_canary_phase0` and `STRIPE_SECRET_KEY=sk_test_serverCanaryPhase0`; these are invented values, not credentials.

| Command/check | Result |
| --- | --- |
| `git rev-parse HEAD`, `git status --short`, `rg --files --hidden -g '!.git'`, complete contract reads | PASS; greenfield audit above |
| `node --version`, `pnpm --version` | PASS; 24.19.0 / 11.19.0 |
| `npm --version`, initial `npm view ...` | FAILED: npm unavailable in this shell; used pnpm and registry HTTP metadata |
| Initial sandbox `pnpm view ...` and registry HTTP calls | BLOCKED by network sandbox; retried registry reads with approved network access |
| `pnpm install` | Initially FAILED on unapproved `unrs-resolver` build; dependencies resolved, then reviewed/allowed native resolver build |
| Initial `pnpm peers check` | FAILED: ESLint 10 incompatible with Next's transitive lint plugins; pinned compatible 9.39.5 |
| `pnpm install --no-frozen-lockfile` with `CI=true` | PASS after compatibility/build-policy corrections |
| `pnpm install --frozen-lockfile` with `CI=true` | PASS; recreated node_modules and installed 401 packages from the committed lock; exit 0 |
| Early sandbox `pnpm lint`, `pnpm test`, `pnpm typecheck` | BLOCKED before tools ran by pnpm dependency reinstallation/policy checks (non-TTY/store settings, then registry EACCES). Corrected workspace settings and ran with approved network access; security verification was not disabled |
| `pnpm lint` | Initially FAILED on anonymous default PostCSS export warning; fixed. Final PASS, zero warnings |
| `pnpm typecheck` | PASS (`next typegen && tsc --noEmit`) |
| `pnpm test` | PASS: 35 tests in 3 files after URL regression fix |
| `pnpm build` | PASS: optimized production build, TypeScript and prerender; only `/` and native not-found |
| `pnpm peers check` (final) | PASS: no peer dependency issues |
| `pnpm exec playwright install chromium` | PASS; Chromium 153.0.8010.12, Playwright revision 1243 |
| `pnpm test:e2e` | PASS: 3/3 at 360, 768, 1280px; keyboard focus, 40px control, no overflow, heading weight, noindex, no page errors; zero serious/critical axe violations |
| `node node_modules/next/dist/bin/next build` with empty/malformed public env | Expected nonzero exit. First attempt revealed an unsafe native URL parser error; fixed with `URL.canParse` and regression tests. Final PASS: safe field-name-only rejection, no input canary leaked |
| `rg -l 'sb_secret_server_canary_phase0\|sk_test_serverCanaryPhase0' .next/static` | PASS: no matches in browser assets (rg exit 1 is the expected no-match result) |
| `git diff --exit-code -- BUILD_SPEC.md docs/product/V1_SCOPE.md docs/implementation/CODEX_PHASE_0_PROMPT.md` | PASS: original contracts/prompt unchanged |

Mobile and desktop Playwright screenshots were visually inspected. They are generated under ignored `test-results/`; no provider, database, or billing behavior is implied by those screenshots. The suggested agent-browser CLI was unavailable; the repository's required Playwright runner supplied the browser evidence instead. Browser test logs contain harmless inherited NO_COLOR/FORCE_COLOR warnings.

pnpm 11 settings are in `pnpm-workspace.yaml`, including the workspace-local store and explicit native build allowances for esbuild, sharp and unrs-resolver. pnpm generated a version-specific release-age exception for the selected Lucide 1.48.0; dependency policy verification still ran successfully. The lockfile, not a floating latest install, defines the selected package graph.

## Remaining boundaries and risks

- ESLint 9.39.5 is marked deprecated by npm. It is the compatible major for Next's current React/import/a11y plugins; revisit when those plugins support ESLint 10. Do not force incompatible peers.
- Supabase factories are not an authentication implementation. Session refresh proxy, auth guards, database schema/types and real provider tests belong to Phase 1 and later.
- Catalog validation checks local shape/coherence only. Stripe-side active price, currency, interval, and amount verification must precede purchasing in Phase 2.
- Placeholder site/support values and real publishable configuration must be supplied by the buyer before use/publication. The root page intentionally remains noindex.
- All G1–G6 full-product release gates remain open. Local checks do not certify hosted auth, RLS, billing/recovery, manual screen-reader/zoom validation, Vercel deployment or repo/ZIP equivalence.

No P2 functionality was added. No remote resources, payments, migrations, deployment, commit or pull request were created.
