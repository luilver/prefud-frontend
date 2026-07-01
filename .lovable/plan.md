## Changes to `src/pages/Brand.tsx`

### 1. Upload the two new logo variants to Lovable Assets
Upload the user-provided images as CDN assets:
- `user-uploads://prefud-white-2.png` → `src/assets/prefud-horizontal-white.png.asset.json`
- `user-uploads://prefud-black.png` → `src/assets/prefud-horizontal-black.png.asset.json`

The existing `prefud-full-logo-v2.png` (color/green horizontal lockup) remains the third variant.

### 2. Replace the "prefud" text in the top nav
Currently the nav shows `<span className="font-logo text-2xl">prefud</span>` on the right. Replace it with an `<img>` of the color horizontal logo (`primaryLogo.url`), height ~32px, alt "Prefud".

### 3. Replace the "prefud" text in the hero
Currently the hero shows a giant Pacifico `prefud` above "Brand Manual". Replace that H1 text with the color horizontal logo image (max-h-24 sm:max-h-32, centered), keeping the "Visual Identity · v1" eyebrow and "Brand Manual" subtitle unchanged. The H1 becomes the visually-hidden "Prefud Brand Manual" for SEO/a11y (or move the H1 to the "Brand Manual" line).

### 4. New "Horizontal Logo Variants" section
Insert a new section (numbered 02, shifting the others) between "Primary Logo" and "Vertical Logos":

- **Title**: "Horizontal Logo — Color / White / Black"
- **Layout**: 3-card grid (grid-cols-1 sm:grid-cols-3)
  - Card 1: Color version (`primaryLogo`), preview on the checker transparency background, download as `prefud-horizontal-color.png`.
  - Card 2: White version on a dark preview background (`bg-neutral-900`), download as `prefud-horizontal-white.png`.
  - Card 3: Black version on a light preview background (`bg-neutral-100`), download as `prefud-horizontal-black.png`.
- Each card reuses the existing `DownloadButton` component and states "Transparent PNG".

### 5. Renumber and extend the "All Downloads" list
- Renumber the following sections (Vertical → 03, Isotypes → 04, Typography → 05, Colors → 06, Downloads → 07).
- Add three entries at the top of the downloads list: Horizontal Color, Horizontal White, Horizontal Black — each with its own download link.

No other files touched. No changes to routing, business logic, or theming.
