

# Remove Gray Translucent Overlay on Mobile

## Problem
Line 237 in `Dashboard.tsx` renders a decorative content wrapper with `bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl` that creates the visible gray translucent overlay on mobile. On desktop it provides a nice frosted-glass effect over the background image, but on mobile (solid black background) it looks like an unnecessary extra layer.

## Solution
Make this overlay transparent on mobile only. Two elements need updating:

### `src/components/Dashboard.tsx`

1. **Line 237** — The translucent background div: conditionally apply `bg-white/40 backdrop-blur-sm border border-white/50 shadow-xl` only on desktop. On mobile, make it fully transparent with no border/shadow:
   - Mobile: `bg-transparent`
   - Desktop: keep current `bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl`

2. **Lines 238-245** — The SVG pattern overlay inside it: hide on mobile (`hidden md:block` or similar) since it serves no purpose on a transparent background.

3. **Line 235** — The parent `<div className="relative">` stays as-is.

## Files modified
- `src/components/Dashboard.tsx` — conditional styling for the content wrapper based on `isMobile`

