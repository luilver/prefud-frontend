# Hybrid RevenueCat implementation for native subscriptions

## Current state (audit)

- `src/services/revenueCatService.ts` only exports `isNativePlatform()` — **no RevenueCat SDK is installed or used**. The filename is misleading.
- All subscription UI is hidden on native via `isNative` guards:
  - `SubscriptionManager.tsx` returns `null` when native.
  - `UserProfile.tsx` hides the "Manage subscription" CTA when native (line 531).
  - `Dashboard.tsx` hides upgrade banners and `<SubscriptionManager />` on native.
  - `DeleteAccountModal.tsx` shows an "manage in store" warning on native.
- Subscription persistence is backend-driven via `subscribeUser(userId, subscriptionTypeId, rukusubscriptionID)` → `POST {BASE_URL}/subscription/subscribe/:userId`. Today the `rukusubscriptionID` is a Stripe subscription id; the same endpoint can be reused for an RC entitlement/transaction id.
- Memory rule "native = reader-only, no subscription UI" is the blocker. The user is explicitly asking to lift it for subscriptions only (cart/signup remain blocked).
- Capacitor is already wired (`capacitor.config.ts`, iOS Podfile lists `@capacitor/camera`, etc.), so adding another Capacitor plugin follows the same install/sync flow.

## Goal

Allow paid plan purchase on iOS/Android via RevenueCat (Apple/Google billing) while keeping Stripe on web — single subscription state synced to the existing backend (`/subscription/...`).

## Plan

### 1. Install + configure RevenueCat
- Add `@revenuecat/purchases-capacitor` (and peer `@revenuecat/purchases-typescript-internal` if required by the version).
- Add two env vars used at runtime: `VITE_RC_IOS_KEY`, `VITE_RC_ANDROID_KEY` (public SDK keys, safe in the bundle). Document in README that the user must paste their RC public SDK keys.
- iOS: add StoreKit capability via Xcode (manual step documented for the user). Android: add `com.android.vending.BILLING` permission to `AndroidManifest.xml`.
- User must run `npx cap sync` after install (documented in handoff).

### 2. Replace the stub `revenueCatService.ts` with a real service
Rewrite `src/services/revenueCatService.ts` to expose:
- `isNativePlatform()` (keep existing export, all current imports keep working).
- `initRevenueCat(appUserId: string)` — calls `Purchases.configure({ apiKey, appUserID })` once per session; no-op on web.
- `getNativeOfferings()` — returns RC `Offerings` (mapped to a small `{ identifier, priceString, product }[]`).
- `purchaseNativePackage(pkg)` — wraps `Purchases.purchasePackage`, returns `{ customerInfo, transactionIdentifier, productIdentifier }`.
- `restoreNativePurchases()` — wraps `Purchases.restorePurchases`.
- `getActiveEntitlement(customerInfo)` — helper to read the active entitlement id (e.g. `family`, `professional`).
- All methods are safe no-ops / throw a friendly "web uses Stripe" error when `!isNativePlatform()`.

### 3. Map RC products ↔ backend subscription types
Each `ApiSubscriptionType` from `/subscriptionType/all` already has `_id` and `name`. Add a tiny client-side map (in `revenueCatService.ts` or new `src/utils/rcProductMap.ts`):

```text
RC product identifier  ->  backend subscriptionTypeId resolver
"family_monthly"       ->  apiPlans.find(p => p.name === "family")._id
"professional_monthly" ->  apiPlans.find(p => p.name === "professional")._id
```

Placeholder identifiers; user fills in real ones from App Store Connect / Play Console.

### 4. Hybrid purchase flow in `SubscriptionManager`
- Remove the `if (isNative) return null;` early return.
- On native: replace the Stripe `PaymentMethodModal` branch with:
  1. `initRevenueCat(user.userId)` on mount (once).
  2. Show plans built from RC `Offerings` (price/period come from the store, not Stripe).
  3. On "Get plan" → `purchaseNativePackage(pkg)`.
  4. On success → call existing `subscribeUser(userId, subscriptionTypeId, customerInfo.originalAppUserId or transactionIdentifier)` so the backend stores the entitlement reference in the same field used for Stripe today.
  5. Refresh user subscription (existing `updateSubscription` in `AuthContext`).
- Add a "Restore purchases" button (Apple requirement) that calls `restoreNativePurchases()` then re-syncs via `subscribeUser`.

### 5. Re-enable subscription affordances on native (scoped)
- `UserProfile.tsx` line 531: allow the "Manage subscription" CTA on native too, but on native open a native paywall sheet (RC offerings) instead of the Stripe modal.
- `Dashboard.tsx`: re-enable upgrade banners and `<SubscriptionManager />` on native.
- `DeleteAccountModal.tsx`: keep the existing "cancel in App Store / Play Store" warning (still correct — cancellation is store-side).
- Keep cart + signup still blocked natively — only subscription UI is unblocked.

### 6. Cancellation + management
- Cancellation cannot be done in-app for store subscriptions. Replace the Stripe "Cancel" button on native with a button that deep-links to:
  - iOS: `https://apps.apple.com/account/subscriptions`
  - Android: `https://play.google.com/store/account/subscriptions?sku=<productId>&package=<bundleId>`
- Web continues to use the existing Stripe cancel flow.

### 7. Backend sync (out of scope but flagged)
- The existing `POST /subscription/subscribe/:userId` is reused with the RC `originalTransactionIdentifier` in `rukusubscriptionID`. **No backend change is strictly required for client-driven sync**, but for production you'll want a RevenueCat webhook → backend so renewals/expirations update without requiring the app to be open. Flag this for the backend team; do not implement here.

### 8. i18n
Add `subscription.restore`, `subscription.manageInStore`, `subscription.nativeUnavailable` keys to `src/contexts/LanguageContext.tsx` (EN/ES/PT).

### 9. Memory update
After implementation, update `mem://constraints/native-platform-restrictions` and the Core index line to: **"Native apps: cart and signup blocked; subscriptions ARE allowed via RevenueCat (Apple/Google billing)."**

## Files to touch

- `package.json` (add `@revenuecat/purchases-capacitor`)
- `ios/App/Podfile` (auto via `cap sync`) and `android/app/src/main/AndroidManifest.xml` (BILLING permission)
- `src/services/revenueCatService.ts` (full rewrite, keep `isNativePlatform` export)
- `src/utils/rcProductMap.ts` (new, small mapping helper)
- `src/components/SubscriptionManager.tsx` (hybrid branch, remove native short-circuit, add Restore button)
- `src/components/UserProfile.tsx` (allow CTA on native, route to RC paywall)
- `src/components/Dashboard.tsx` (drop native guards around upgrade UI)
- `src/components/DeleteAccountModal.tsx` (link to store subscriptions page)
- `src/contexts/LanguageContext.tsx` (new keys)
- Memory files (constraint update)

## Out of scope

- Backend webhook integration with RevenueCat.
- Migrating existing Stripe subscribers to RC or vice versa.
- Cart and signup remain blocked natively.
- Real product identifiers — placeholders until the user provides them from App Store Connect / Play Console.

## Handoff steps for the user (after implementation)

1. Create products + entitlements in RevenueCat dashboard, App Store Connect, Play Console.
2. Paste public SDK keys into `VITE_RC_IOS_KEY` / `VITE_RC_ANDROID_KEY`.
3. Update the identifiers in `src/utils/rcProductMap.ts`.
4. Run `npm install` then `npx cap sync ios && npx cap sync android`.
5. Test sandbox purchases on a real device (simulators don't support StoreKit purchases well).
