# Engineering contract

Read `docs/product/V1_SCOPE.md` and `BUILD_SPEC.md` before editing. The scope is immutable and wins; stop and report conflicts. Implement only the requested slice. Phase 0 is foundation, not a release of the full product.

Architecture map: `docs/ARCHITECTURE.md`. Setup: `docs/SETUP.md`. Use App Router, strict TypeScript, pnpm and its committed lockfile. Keep a single light theme, Inter body and Funnel Sans 600 headings, semantic tokens, and only primitives actively needed by the slice.

Do not add P2/dormant features, alternative providers, teams, dark mode, one-time billing, trials, promotions, blog, analytics, chat or app email. V1 Scope 1.1 supports exactly three auth paths under Supabase Auth: Google OAuth, magic-link login, and email/password with verification/reset. Additional OAuth providers, MFA, SSO and alternative auth frameworks remain outside V1. Preserve individual accounts, Free + one Pro monthly/annual, server-owned catalog and financial facts. Never trust client price/customer/owner/entitlement data. Never weaken auth, RLS, security checks or evidence to get passing tests. Missing credentials/evidence are not production PASS. Never print secrets.

Supabase clients are foundations only. Add verified session handling and auth guards before protected routes. Generate schema types from actual migrations. Pro creates/edits own Notes; Free may only read/delete retained own Notes. Billing must work without browser return and remain recoverable/idempotent.

Canonical local checks: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; browser harness: `pnpm exec playwright install chromium`, `pnpm test:e2e`. Required env is documented in `.env.example`. Do not add commands that silently pass while their tests do not exist.

Definition of done: scoped implementation, relevant behavior tests, successful lint/types/build, updated setup/architecture when needed, exact changed-file and command-result report, all unresolved issues explicit. Full release requires the product's G1–G6 evidence, not just these local checks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
