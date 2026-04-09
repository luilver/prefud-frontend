

# Replace Dashboard Background Image with Soft Geometric Pattern

## What changes
Remove the two background JPG images (`dashboard-tabs-bg.jpg` and `dashboard-tabs-bg-mobile.jpg`) and replace them with a lightweight CSS-only geometric mesh pattern that matches the emerald/teal aesthetic.

## File: `src/components/Dashboard.tsx`

1. **Remove** the two image imports (`dashboardTabsBg`, `dashboardTabsBgMobile`)
2. **Replace** the `<div>` that renders the background image (the one using `backgroundImage: url(...)`) with a CSS-only pattern using an inline SVG data URI — a subtle dot-mesh or hexagonal pattern in emerald tones at low opacity (~5-8%)
3. Keep the existing `bg-white/40 backdrop-blur-sm` glassmorphism wrapper untouched

The pattern will be a repeating SVG grid of soft circles or intersecting lines in `emerald-200` at very low opacity, giving texture without visual weight. No extra dependencies needed — pure CSS.

## Result
- Faster load (no image fetch)
- Consistent across all screen sizes (no mobile/desktop variants needed)
- Maintains the glassmorphism + emerald design language

