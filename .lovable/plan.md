## Fixes to `/brand` page

**1. Rename section**
In `src/pages/Brand.tsx`, rename the "Horizontal Logos" section heading (and any related copy/anchor) to "Vertical Logos". Keep the same assets and download buttons.

**2. Fix Isotypes section — crop just the bowl**
Currently the Isotypes section reuses the full uploaded images (bowl + "prefud" wordmark + palette caption). The isotype should be only the bowl illustration.

Approach: generate 4 new transparent-PNG isotype assets (one per theme), cropped/derived from each uploaded reference so only the bowl mark remains — no wordmark, no caption, no background.

- Default (Classic Green) — teal/olive bowl, from `WhatsApp_Image_2026-06-28_at_22.39.12-7.jpeg`
- Citrus Bloom — coral/green bowl, from `...22.39.29-4.jpeg`
- Aquatic Flow — blue/teal bowl, from `...22.39.30-4.jpeg`
- Evening Flavors — purple/bronze bowl, from `...22.39.30_1-4.jpeg`

Each output: transparent PNG, square, tight crop around the bowl mark. Upload via `lovable-assets` and store pointers under `src/assets/isotype-<theme>.png.asset.json`.

**3. Wire new isotypes into Brand page**
Replace the 4 image sources used in the Isotypes grid with the new cropped assets. Keep the checkerboard preview background, individual Download buttons, and the consolidated downloads list (update those entries to point at the new isotype files). Horizontal/Vertical logo assets are unchanged.

No other pages or theme logic are touched.
