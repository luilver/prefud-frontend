# Theme System with Logo Switching + Settings Section

## Overview

Implement a theme system letting users choose between 4 color palettes, each with its own matching logo. Add a "Settings" section in the Profile page where users select the theme. Persist the choice and apply it globally. Full multilingual support (EN/ES/PT).

## The 4 Themes

| Theme | Name (EN / ES / PT) | Primary | Secondary | Logo |
|---|---|---|---|---|
| `default` | Classic Green / Verde Clásico / Verde Clássico | #186047 | #A4B237 | prefud original (green) |
| `citrus` | Citrus Bloom / Floración Cítrica / Floração Cítrica | #FF7F50 | #32CD32 | prefud orange→green gradient |
| `aqua` | Aquatic Flow / Flujo Acuático / Fluxo Aquático | #008080 | #87CEEB | prefud blue/teal |
| `dusk` | Evening Flavors / Sabores del Anochecer / Sabores do Anoitecer | #800080 | #B87333 | prefud purple/bronze |

## Are colors currently themed?

Yes — `index.css` already defines semantic HSL tokens (`--primary`, `--secondary`, `--background`, etc.) consumed via Tailwind. The hardcoded emerald/teal gradients scattered across components are the main exception, but since the user asked only for palette switching at the token level (not a refactor of every gradient), we'll override the core semantic tokens per theme. Existing emerald-specific utilities will keep working but new theme colors will shine through anywhere semantic tokens are used.

## Implementation Steps

### 1. Logo Assets
- Upload the 4 logo images (from user uploads) as transparent PNGs via `lovable-assets`:
  - `src/assets/logo-default.png.asset.json`
  - `src/assets/logo-citrus.png.asset.json`
  - `src/assets/logo-aqua.png.asset.json`
  - `src/assets/logo-dusk.png.asset.json`
- The existing white/black filtered versions (`brightness-0 invert`) keep using whichever logo is active — filters still produce a white silhouette regardless of palette, so dark navbars stay consistent.

### 2. Theme Tokens (`src/index.css`)
Add `[data-theme="citrus"]`, `[data-theme="aqua"]`, `[data-theme="dusk"]` selectors that override `--primary`, `--secondary`, `--accent`, `--ring`, `--sidebar-primary`, and related HSL tokens. Default theme stays in `:root`.

### 3. ThemeContext (`src/contexts/ThemeContext.tsx`)
- State: `theme: 'default' | 'citrus' | 'aqua' | 'dusk'`
- Persists to localStorage (`pantry_theme`)
- On change: sets `document.documentElement.dataset.theme`
- Exposes `logoUrl` mapped to the current theme's asset
- Wrap app in `App.tsx`

### 4. useThemeLogo helper
Small hook returning the current logo URL. Replace hardcoded `prefudFullLogo` imports in:
- `Navigation.tsx` (sidebar)
- `Index.tsx` (homepage navbar + footer)
- `Landing.tsx` (footer)
- `SignIn.tsx` (header)
- `WhyPantry.tsx` (navbar)

White/inverted contexts keep their `brightness-0 invert` filter.

### 5. Settings Section in Profile (`src/pages/UserProfile.tsx`)
Add a new "Settings" card below the existing sections containing:
- **Theme picker**: 4 visual swatches (palette preview + logo thumbnail + name). Selecting one updates `ThemeContext` immediately.
- (Future-friendly placement; language selector already lives elsewhere — we'll cross-link or move it here only if you confirm.)

### 6. Translations (`LanguageContext.tsx`)
Add flat dot-notation keys for EN, ES, PT:
- `settings.title`, `settings.theme.title`, `settings.theme.description`
- `settings.theme.default`, `settings.theme.citrus`, `settings.theme.aqua`, `settings.theme.dusk`

## Out of scope
- No changes to white/black logo variants on dark navbars (they remain filtered silhouettes per your earlier instruction).
- No refactor of hardcoded emerald gradients into tokens — only the semantic tokens flip per theme.
- Language selector relocation (ask separately if desired).

## Files touched
- New: `src/contexts/ThemeContext.tsx`, 4 logo `.asset.json` pointers
- Modified: `src/index.css`, `src/App.tsx`, `src/pages/UserProfile.tsx`, `src/contexts/LanguageContext.tsx`, plus 5 logo-consuming components listed above
