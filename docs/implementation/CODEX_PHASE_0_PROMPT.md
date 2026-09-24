# Codex Prompt — Phase 0: Repository Audit + Foundation

You are implementing **DaysNotWeeks V1**.

## Authority

Read these files completely before editing anything:

1. `docs/product/V1_SCOPE.md`
2. `BUILD_SPEC.md`
3. existing `AGENTS.md` or equivalent repository instructions, if present

Precedence:

- `docs/product/V1_SCOPE.md` is the immutable product contract.
- `BUILD_SPEC.md` is the implementation contract.
- If they conflict, stop and report the conflict. `V1_SCOPE.md` wins.

## Goal of this phase

Establish a clean, current, reproducible foundation for the remaining implementation.

This phase must **not** implement the full product.

## First: audit the repository

Before changing files, inspect and report:

- current HEAD SHA
- package manager and lockfile
- current Next.js / React / TypeScript versions
- current app-router structure
- existing auth implementation
- existing Supabase integration
- existing Stripe integration
- existing DB/migrations
- current test/lint/typecheck/build tooling
- existing design-system/UI libraries
- existing docs and env files
- dead/legacy/P2 code that conflicts with V1 scope
- whether the repository is greenfield, partially implemented, or requires cleanup

Do not infer implementation state from `V1_SCOPE.md`.

## Resolve versions

Use current stable, mutually compatible versions appropriate for production at implementation time.

Do not select framework versions from memory without checking the actual package ecosystem/repository constraints available to you.

Preserve the existing package manager if valid.

Do not perform an unrelated dependency modernization sweep.

## Implement only the Phase 0 foundation

Target:

- Next.js App Router only
- TypeScript strict
- one Tailwind + current shadcn-compatible primitive approach
- Inter for UI/body
- Funnel Sans for major headings
- semantic design tokens
- Lucide icons
- env validation with correct public/server separation
- canonical product/site/catalog config skeleton
- Supabase browser/server client foundations
- test harness foundations
- lint/typecheck/build scripts
- route groups/shell skeletons only where useful for future slices
- no dark mode
- no Google OAuth
- no magic link
- no teams/orgs/RBAC
- no one-time/lifetime/trials/promotions
- no blog/CMS/analytics/chat/app-email subsystem
- no rich-text Notes editor
- no fake dashboard functionality

## Design tokens

Implement the approved light-theme foundation:

- radius 8/6/4px
- thin cool-neutral borders
- very restrained `shadow-sm`
- near-black primary
- neutral white/light-gray surfaces
- Inter for UI/body
- Funnel Sans weight 600 for major headings
- semantic CSS variables, not scattered hardcoded theme values

Controls:

- default button/input height 40px
- small button 36px
- large button 44px

## Configuration

Create or consolidate one coherent configuration surface for at least:

- brand name
- site URL
- support email
- navigation placeholders
- SEO defaults
- billing catalog shape
- currency
- Pro monthly/annual IDs/placeholders

Do not trust client-supplied Stripe price IDs later.

Do not hardcode real secrets.

## Environment

Create/update `.env.example`.

It must:

- contain no secrets
- distinguish browser-safe vs server-only values
- not include Google OAuth variables
- give concise setup comments

Fail early and safely when required runtime configuration is missing.

Do not print secret values in validation errors.

## UI skeleton

You may create only the minimum reusable primitives/layout hooks required to establish the design system.

Do not build all screens yet.

Avoid importing an entire component gallery.

## Verification

At the end:

- install from lockfile
- lint
- typecheck
- run existing/new relevant unit tests
- build

If any command fails, fix it if it belongs to this slice. Otherwise report the exact blocker.

## Deliverable report

Return:

1. repository audit summary
2. architecture/version decisions made
3. files changed
4. dependencies added/removed and why
5. commands executed and exact pass/fail status
6. remaining blockers/risks
7. explicit confirmation that no P2 functionality was added

## Mandatory footer

Treat `docs/product/V1_SCOPE.md` as the immutable product contract and `BUILD_SPEC.md` as the implementation contract. If they conflict, stop and report the conflict; `V1_SCOPE.md` wins. Do not add functionality outside the supplied slice. Do not add abstractions, dependencies, routes, providers, or product features unless required by the contract. Never weaken auth, RLS, billing, or evidence requirements to make a test pass. Before finishing, run the relevant lint, typecheck, tests, and build. Report exactly what changed, which commands were executed, their results, and every unresolved issue.
