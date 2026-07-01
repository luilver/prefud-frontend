## New Page: `/brand` — Prefud Brand Manual

A public, design-forward brand manual page documenting Prefud's visual identity with downloadable logo assets.

### Route
- Add `/brand` to `src/App.tsx` routing (public, no auth required).
- Create `src/pages/Brand.tsx` with `useDocumentTitle("Brand Manual")`.

### Page Sections

**1. Hero**
- Large "Prefud Brand Manual" title (Pacifico + Montserrat mix).
- Tagline: short description of the brand's visual language.

**2. Logo System**
- **Primary Logo** (`prefud-full-logo-v2.png`) — large preview on a checkered transparency background + Download PNG button.
- **Horizontal Logo** — the theme-aware horizontal logos already used in nav. Show all 4 variants (default, citrus, aqua, dusk) each with its own Download button.
- **Isotype (icon-only)** — extract/prepare 4 isotype PNGs (one per theme). Each shown with transparent bg + Download.
  - Technical note: The current `logo-{theme}.png` assets are full horizontal lockups. To provide true isotypes, I'll generate 4 new transparent PNG isotypes via imagegen (mark-only, matching each palette) and upload them via lovable-assets.

**3. Typography**
- **Pacifico** — used for the logo wordmark. Live sample at large size + usage rules ("logo only, never body copy").
- **Montserrat** — UI font. Show weight ladder: 400 body, 500 h4-h6, 700 h1-h3. Sample paragraph + heading scale.
- Note the legacy aliases (`font-inter`, `font-poppins`) both resolve to Montserrat.

**4. Color System**
Four palettes, each as a card with swatches (hex + HSL + token name):
- **Default (Classic Green)** — `#186047`, `#A4B237`, plus secondary/accent/background tokens.
- **Citrus Bloom** — `#FF7F50`, `#32CD32`.
- **Aquatic Flow** — `#008080`, `#87CEEB`.
- **Evening Flavors** — `#800080`, `#B87333`.
Each card renders using its actual `[data-theme="..."]` scope so tokens (primary, secondary, accent, ring) render live.
Include a "Copy hex" click for each swatch.

**5. Download Section (summary)**
Grid recap of all downloadable assets with a single-click download each. Downloads use an anchor with `download` attribute pointing at the `.asset.json` `url` field.

### Visual Style
- Uses existing design tokens only (no hardcoded colors) so the page itself adapts to the currently selected theme, while the palette cards force their own `data-theme` scope to preview all four.
- Clean, editorial layout: generous whitespace, section dividers, monospace for hex codes.
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop for swatch grids.

### Assets to create
- 4 new isotype PNGs via `imagegen--generate_image` (transparent bg, mark-only, one per palette), uploaded through `lovable-assets` CLI → `src/assets/isotype-{theme}.png.asset.json`.

### Files
- Create: `src/pages/Brand.tsx`, 4 new isotype asset pointers.
- Edit: `src/App.tsx` (add route).
- No changes to translations, contexts, or business logic.

### Out of scope
- No link added to navigation (page is standalone/shareable via URL). If you want it linked from the footer or profile, say so and I'll add it.
