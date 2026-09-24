# DaysNotWeeks

Phase 0 foundation for an individual-account subscription SaaS. This repository is not a finished product: auth, database/RLS, Notes, and Stripe flows are future slices.

Use Node 24 (tested with 24.19.0) and pnpm 11.19.0. Install pnpm through your Node toolchain if necessary.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local`, fill the required public Supabase values and support inbox, then:

```sh
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

See [setup](docs/SETUP.md), [architecture](docs/ARCHITECTURE.md), and the [Phase 0 report](docs/implementation/PHASE_0_REPORT.md). Product authority: [V1 scope](docs/product/V1_SCOPE.md), followed by [BUILD_SPEC](BUILD_SPEC.md). This slice adds no P2 functionality.
