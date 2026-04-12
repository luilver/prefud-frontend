

# Hide Subscription Sections on Native (iOS/Android) in Profile

## Context
On native mobile apps (iOS/Android), subscriptions are managed through RevenueCat/App Store/Play Store, so the web-based subscription UI should be hidden. The app already has `isNativePlatform()` from `src/services/revenueCatService.ts` using `Capacitor.isNativePlatform()`.

## Changes

### 1. `src/components/UserProfile.tsx`
- Import `isNativePlatform` from `@/services/revenueCatService`
- Add a const: `const isNative = isNativePlatform();`
- **Hide the Subscription Information Accordion** (lines 525-647): wrap in `{!isNative && (...)}`
- This removes: the "Actual Plan" badge, subscription counters (meal plans, special meals, healthy drinks, generated meals), plan status, and the cancel subscription button — all in one block

### 2. `src/components/DeleteAccountModal.tsx`
- Import `isNativePlatform` from `@/services/revenueCatService`
- Wrap the "cancel subscription" list item (lines 53-59) in a conditional: `{!isNativePlatform() && (...)}` so that the text "Your active subscription will be cancelled immediately" is hidden on native

## Files modified
- `src/components/UserProfile.tsx` — hide subscription accordion on native
- `src/components/DeleteAccountModal.tsx` — hide subscription cancellation warning on native

