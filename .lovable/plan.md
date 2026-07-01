## New Page: `/brand` — Prefud Brand Manual

A public brand manual page documenting Prefud's visual identity with downloadable logo assets. The 4 uploaded reference images become the source-of-truth "isotype/logomark" downloads.

### Uploaded assets → CDN
Upload the 4 user-provided images to Lovable Assets (`.asset.json` pointers) as the canonical isotypes/logomarks per palette:
- `logomark-default.jpeg` — official logo (green bowl + gradient wordmark) — from image 1
- `logomark-citrus.jpeg` — Variación 4: Floración Cítrica Digital — from image 2
- `logomark-aqua.jpeg` — Variación 5: Flujo Acuático de Bytes — from image 4
- `logomark-dusk.jpeg` — Variación 6: Sabores del Anochecer — from image 3

The existing `prefud-full-logo-v2.png` remains the primary/full logo, and the existing `logo-default/citrus/aqua/dusk.png` remain the horizontal-lockup logos already used in the nav.

### Route
- Add `/brand` route to `src/App.tsx` (public, no auth).
- Create `src/pages/Brand.tsx`, set `useDocumentTitle("Brand Manual")`.

### Page Sections

**1. Hero**
- Wordmark "prefud" in Pacifico + subtitle "Brand Manual" in Montserrat.
- One-line tagline about the visual system.

**2. Logo System** (3 subsections, each with preview on a checkered transparency background + Download button)
- **Primary Logo** — `prefud-full-logo-v2.png`, one big preview, Download PNG.
- **Horizontal Logos** — 4 cards (default / citrus / aqua / dusk) using the existing `logo-{theme}.png` assets, each with Download.
- **Logomark / Isotype** — 4 cards for the newly uploaded reference images, each with Download.

Downloads use `<a href={asset.url} download>`.

**3. Typography**
- **Pacifico** — logo wordmark. Live sample at 96px, plus rule "reserved for the logo, never body copy".
- **Montserrat** — UI font. Weight ladder: 700 (h1–h3), 500 (h4–h6), 400 (body). Show heading scale + body sample.
- Note: `font-inter` and `font-poppins` aliases both resolve to Montserrat.

**4. Color System — 4 Palettes**
Grid of 4 palette cards. Each card is wrapped in a `<div data-theme="...">` so its tokens render live (primary/secondary/accent/ring/background). Within each card:
- Palette name + Spanish variation name.
- Signature hex swatches (with hex code, HSL, and token label) — click-to-copy.
- A mini "tokens in action" strip: button, badge, ring, card surface.

Palettes:
- **Default — Verde Corporativo**: `#186047` Verde Teal Primario, `#A4B237` Verde Oliva Secundario, `#F7F6F1` Fondo de Papel.
- **Citrus — Floración Cítrica Digital**: `#FF7F50`, `#32CD32`.
- **Aqua — Flujo Acuático de Bytes**: `#008080`, `#87CEEB`.
- **Dusk — Sabores del Anochecer**: `#800080`, `#B87333`.

**5. Download Summary**
Compact grid recap of every downloadable asset (primary + 4 horizontal + 4 logomarks = 9 downloads), single click each.

### Visual Style
- Editorial layout, generous whitespace, monospace for hex codes, section dividers.
- Uses semantic tokens (`bg-card`, `text-primary`, `border-border`) — no hardcoded colors on the page chrome, so it also adapts to the currently selected theme. Palette cards force their own `data-theme` scope so all four palettes preview simultaneously.
- Responsive: 1-col mobile, 2-col tablet, up to 4-col desktop for logo/palette grids.

### Files
- Create: `src/pages/Brand.tsx`.
- Create: 4 `.asset.json` pointers under `src/assets/` for the uploaded reference images.
- Edit: `src/App.tsx` (add `/brand` route + import).
- No changes to contexts, translations, business logic, or navigation. Page is standalone/shareable via URL (say the word if you want it linked from the footer/profile).
