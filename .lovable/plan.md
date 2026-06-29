## Update WhyPantry Navbar Logo

The `/why-pantry` page header still uses the old branding: a `Utensils` icon from lucide-react plus the manual "prefud" wordmark. Replace it with the new full-logo PNG asset already in use on the landing page and sign-in page.

### Changes
- **File:** `src/pages/WhyPantry.tsx`
  - Import `prefud-full-logo-v2.png.asset.json`.
  - Replace the `<div>` containing the `Utensils` icon and `<h1>` wordmark with a single `<img>` using the imported logo URL.
  - Remove the now-unused `Utensils` import from lucide-react.
  - Size the logo at `h-10` (matching the homepage navbar height) to fit the sticky header.

This makes the `/why-pantry` navbar consistent with the rest of the site branding.