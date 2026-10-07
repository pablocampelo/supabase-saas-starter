# Contributing

Contributions that improve the supported starter are welcome.

## Before opening a pull request

1. Read [Product Scope 2.0](docs/product/SCOPE.md). The starter is intentionally feature-closed.
2. Prefer fixes, reliability improvements, documentation improvements and supported-integration maintenance over new product surface.
3. Keep the existing Auth, ownership, RLS and billing trust boundaries intact.
4. Keep changes focused. Avoid speculative abstractions and unrelated dependency churn.

## Local verification

Run the checks relevant to your change. Before requesting review, the full supported verification path is:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm supabase:start
pnpm supabase:db:reset
pnpm supabase:test:db
pnpm supabase:types
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm supabase:db:reset` is destructive to the local Supabase database. Never point it at hosted data.

## Pull requests

- Explain the user or maintainer problem being solved.
- Call out security, Auth, RLS or billing implications explicitly.
- Update documentation when behavior or setup changes.
- Keep generated database types in sync with migrations.
- Do not include secrets, live credentials or customer data.

Changes outside the canonical product scope should propose the scope change explicitly rather than silently expanding the starter.
