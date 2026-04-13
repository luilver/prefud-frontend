

# Remove RevenueCat & Hide Reels Feature

## Summary
Remove the RevenueCat in-app purchase integration entirely (since native apps don't need subscriptions) and hide the Reels tab from navigation. Keep the Reels component code intact for future use.

## Changes

### 1. Replace `src/services/revenueCatService.ts` with a minimal stub
Keep only `isNativePlatform()` (still used for conditional UI hiding) and remove all RevenueCat SDK imports/functions. This avoids breaking the existing `isNativePlatform()` calls in Dashboard, UserProfile, DeleteAccountModal, and SubscriptionManager.

### 2. Clean up `src/components/SubscriptionManager.tsx`
- Remove all RevenueCat imports (`getOfferings`, `purchasePackage`, `restorePurchases`, `getRevenueCatProductId`, `getBackendSubscriptionTypeId`, `PurchasesPackage`)
- Remove `rcPackages` state, `handleNativePurchase` function, native purchase branch in `handleSelectPlan`, and the "Restore Purchases" button
- Remove the native guard (`if (isNative) return null`) since subscriptions are web-only now
- Keep the `isNative` check only if needed, otherwise simplify to always show web flow

### 3. Clean up `src/App.tsx`
- Remove `initializeRevenueCat` and `identifyUser` imports
- Remove the two `useEffect` blocks that initialize and identify RevenueCat users

### 4. Remove `@revenuecat/purchases-capacitor` from `package.json`

### 5. Hide Reels in `src/components/Navigation.tsx`
- Remove the `{ id: "reels", label: "Reels", icon: Play }` entry from `navItems` array
- Remove the `Play` icon import if unused elsewhere

### 6. Hide Reels tab content in `src/components/Dashboard.tsx`
- Remove the `<TabsContent value="reels">` block and the `Reels` import
- (Optional) remove the `Reels` import to reduce bundle size

## Files modified
- `src/services/revenueCatService.ts` — replace with stub keeping only `isNativePlatform()`
- `src/components/SubscriptionManager.tsx` — remove all RevenueCat logic
- `src/App.tsx` — remove RevenueCat initialization
- `src/components/Navigation.tsx` — remove Reels nav item
- `src/components/Dashboard.tsx` — remove Reels tab content and import
- `package.json` — remove `@revenuecat/purchases-capacitor`

