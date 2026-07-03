## Add themed horizontal logos to the Brand page

Extend the "Horizontal Logo" section on `/brand` with three additional themed horizontal lockups — Citrus Bloom, Aquatic Flow, and Evening Flavors — where the isotype (bowl mark) sits on the left and the "prefud" wordmark on the right.

### 1. Build the horizontal artwork per theme
The existing `logo-citrus.png`, `logo-aqua.png`, and `logo-dusk.png` are vertical stacks (isotype on top, Pacifico wordmark below) on a cream paper background. Using Python + PIL in the sandbox:
- Load each themed vertical PNG.
- Remove the cream background to obtain a transparent-background version.
- Compute the tight bounding box of non-transparent pixels, then split it horizontally into the top half (isotype) and bottom half (wordmark) using the natural vertical gap between the two elements.
- Compose a new canvas (wide, e.g. 1600×600) with the isotype anchored on the left and the wordmark anchored on the right, vertically centered, with consistent padding and a small gutter between them.
- Save as `prefud-horizontal-citrus.png`, `prefud-horizontal-aqua.png`, `prefud-horizontal-dusk.png` (transparent PNGs).

### 2. Upload as CDN assets
Run `lovable-assets create --file …` for each generated PNG and write the resulting pointer to `src/assets/prefud-horizontal-{theme}.png.asset.json`. Delete the temporary PNGs from `/tmp`.

### 3. Update `src/pages/Brand.tsx`
- Import the three new `.asset.json` files.
- In the "Horizontal Logo — Color / White / Black" section (section 02), rename the heading to **"Horizontal Logo Variants"** and split the section into two grouped subsections while keeping the same section number:
  - **Neutral variants** — the existing 3 cards: Color (green primary), White (on dark), Black (on light).
  - **Themed variants** — a new grid of 3 cards: Citrus Bloom, Aquatic Flow, Evening Flavors, each shown on the transparent checker background with a `Download PNG` button (`prefud-horizontal-{theme}.png`).
- Each themed card matches the existing card styling (Card + CheckerBg + label + download).
- Add the three new filenames to the "All Downloads" list at the bottom of the page.

### Technical notes
- Only `src/pages/Brand.tsx` is edited; three new asset pointers are added under `src/assets/`.
- No routing, business logic, or theme system changes.
- The horizontal compositions are new bitmap files — they are not generated at runtime.
