
# Hide All Subscription UI on Native iOS/Android

## What I found
The profile already hides one subscription card in `UserProfile.tsx`, and the delete-account warning is already hidden on native in `DeleteAccountModal.tsx`.

The real reason you still see subscription content in iOS is:
- `Dashboard.tsx` always renders `<SubscriptionManager />` inside the Profile tab
- `SubscriptionManager.tsx` contains all the sections you mentioned:
  - `Actual Plan`
  - `Update your plan`
  - `Restore Purchases`
  - `All plans include`

So this is not mainly a RevenueCat SDK issue; it is a UI rendering issue on native.

## Implementation plan

### 1. Stop showing `SubscriptionManager` on native
In `src/components/Dashboard.tsx`:
- import `isNativePlatform` from `@/services/revenueCatService`
- create `const isNative = isNativePlatform();`
- render `<SubscriptionManager />` only when `!isNative`

This is the cleanest fix because it removes the whole subscription block from the Profile tab for iOS/Android.

### 2. Keep `UserProfile.tsx` native exclusion consistent
In `src/components/UserProfile.tsx`:
- replace inline `!isNativePlatform()` usage with a single `const isNative = isNativePlatform();`
- keep the subscription accordion hidden with `!isNative`

This avoids repeated platform checks and keeps behavior consistent.

### 3. Keep delete-account modal warning hidden on native
In `src/components/DeleteAccountModal.tsx`:
- keep the current native exclusion
- optionally normalize it to use a local `const isNative = isNativePlatform();` for consistency

### 4. Optional hardening inside `SubscriptionManager.tsx`
Even if it is hidden from `Dashboard`, I recommend also adding a native guard in `src/components/SubscriptionManager.tsx`:
- either return `null` immediately on native
- or wrap the whole page UI in `!isNative`

This prevents the component from showing accidentally elsewhere later.

## Files to update
- `src/components/Dashboard.tsx` — hide `SubscriptionManager` on native
- `src/components/UserProfile.tsx` — keep native exclusion but normalize the check
- `src/components/DeleteAccountModal.tsx` — keep native exclusion but normalize the check
- `src/components/SubscriptionManager.tsx` — optional safeguard to prevent future native rendering

## Result on iOS/Android
In the Profile area, native users will no longer see:
- Actual Plan
- Update your plan
- Restore Purchases
- All plans include
- subscription plan cards / subscription type area
- subscription counters section
- delete-account text saying the active subscription will be cancelled immediately

## Technical note
I would not remove RevenueCat integration itself unless you truly want to stop using native in-app purchases. Your request sounds like: keep native purchases available in the app architecture, but hide all web-style subscription management UI from the native profile experience. This plan does that safely.
