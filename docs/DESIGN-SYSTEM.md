# Visual system — Linear-inspired

Reference: the user-supplied Linear DESIGN.md (Refero Styles). This project adopts its visual principles, **not** Linear's trademarks, product assets or proprietary typefaces.

## Canonical tokens
The source of truth is `app/globals.css`. All UI uses its semantic Tailwind tokens; avoid literal hex values in product components.

- Canvas `#08090a`; cards `#0f1011`; elevated surfaces `#161718`.
- Structural edge `#303238` and muted text `#a3a9b4` (slightly brighter than the raw reference for text accessibility).
- Primary action white `#ffffff` with near-black text and pill radius. Acid lime `#e4f222` is reserved for the Pricing MOST POPULAR badge.
- Inter Variable for all UI and headings; variable weight ~510. No extra font dependency.
- Radii: pill buttons, 6px inputs, 12px cards; simple 4px spacing rhythm.
- Contrast, functional status colors, keyboard focus and reduced-motion accessibility override decorative fidelity.

## Components
- `components/ui/button.tsx`: primary, outline, ghost, destructive.
- `components/shared/patterns.tsx`: panels, notices, badges, headings and empty states.
- `components/ui/dialog.tsx`: dialog and mobile drawer.
- `components/marketing/*`: public surfaces, pricing and FAQ.
- `components/auth/*`: preview and production authentication.
- `components/app/*`: app shell, account, billing and replaceable example.

## Rules
Use white pill buttons for primary actions, with a neutral secondary hierarchy. Keep all secondary actions neutral, use surface contrast rather than large shadows, and retain a visible focus indicator. Avoid copying Linear's logo or its screenshots. Keep Auth, RLS, billing contracts and navigation semantics independent of the theme.
