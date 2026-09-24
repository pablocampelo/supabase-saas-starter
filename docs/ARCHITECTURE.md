# Phase 0 architecture

The immutable product contract is `docs/product/V1_SCOPE.md`; `BUILD_SPEC.md` specifies its implementation. No conflict was found for this slice. Original contracts remain unchanged.

| Location | Responsibility |
| --- | --- |
| `app/layout.tsx`, `app/globals.css` | App Router root, local fonts, semantic light tokens |
| `app/(marketing)/page.tsx` | Minimal, noindex foundation preview; no product flows |
| `components/ui/button.tsx` | One owned shadcn-compatible Radix Slot primitive; 36/40/44px sizes |
| `config/product.ts` | Editable brand, SEO, navigation placeholders, legal destinations, currency and plan labels |
| `config/site.ts` | Server-side combination of product config and validated environment |
| `config/catalog.ts` | Server-owned monthly/annual purchasable catalog; fails closed when unconfigured |
| `lib/env/` | Pure testable validation and separate public/server environment readers |
| `lib/supabase/` | Browser and request-scoped unprivileged server client factories |
| `tests/unit/` | Env, catalog, and cookie-adapter behavior; no provider certification |
| `tests/e2e/` | Playwright + axe smoke at 360/768/1280px |

The small primitive uses Radix Slot rather than installing an entire component gallery. Only necessary variants exist; no second primitive family or theme provider. Native future inputs share the 40px control token. Inter and Funnel Sans ship through pinned Fontsource assets consumed by `next/font/local`; no build-time font download or visitor Google request. Major headings use Funnel Sans 600. Font packages include their licenses.

Public env reads use explicit `NEXT_PUBLIC_*` references so Next can inline them. Server readers and the catalog are guarded with `server-only`. Pure schema modules hold no secrets and do not access the environment. Validation reports only known field paths. There is no validation bypass flag.

Supabase factories use only the publishable key and do not confer authorization. The server factory forwards cookie options and propagates write failures. Until Phase 1 adds the refresh proxy, use session-changing calls only in a Server Action/Route Handler. A factory must not be mistaken for an auth guard. No protected routes, DB tables, migrations, generated database types, admin client or remote connection claims are included yet. Generate real types when Phase 1 introduces the schema; do not invent a schema now.

Future sensitive operations must independently authenticate/authorize. Supabase is identity authority; RLS must also protect direct Data API access. Financial facts must remain server-owned. Notes will be a replaceable example; identity and billing must never depend on its domain. Browser-return URLs must never grant Pro.

The official Stripe SDK is deferred until Phase 2 consumes it; Phase 0 only establishes catalog/config boundaries. All full-product gates remain open, including hosted auth, real A/B/anon RLS, Stripe lifecycle/recovery, deployed accessibility and release packaging.
