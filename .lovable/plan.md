

# Hide Cart on Native (iOS & Android)

## Problem
The cart icon is still visible on native Android (and iOS) devices. The `isNative` variable already exists in Dashboard.tsx but was never applied to the cart buttons.

## Changes

### `src/components/Dashboard.tsx`
- Wrap the **desktop cart button** (around lines 140-155) in `{!isNative && (...)}`
- Wrap the **mobile cart button** (around lines 192-207) in `{!isNative && (...)}`

Both use the existing `const isNative = isNativePlatform();` already defined at line 38.

## Files modified
- `src/components/Dashboard.tsx` — hide both cart buttons on native platforms

