## Goal

Add a fifth usage card "Process Images" to the subscription section on the profile page (tracks `processImages` — image-to-ingredients analyses available), wire the new field through types/contexts, and polish the 5-card layout so it scales cleanly.

## Changes

### 1. Data layer — surface `processImages`
- `src/components/UserProfile.tsx`: add `processImages: number` to both the subscription-type interface (limit) and the current-subscription-info interface (remaining).
- `src/contexts/SubscriptionContext.tsx`: add `processImages: number` to `SubscriptionInfo` + a derived `canProcessImage` boolean.
- `src/utils/mapSubscriptionPlans.ts` and `src/services/payments.ts` (`ApiSubscriptionType`): add `processImages` and include a `Process Images: N` row in plan features.
- `src/components/SubscriptionManager.tsx` + `src/components/SubscriptionPurchase.tsx`: include the new field in the features list per plan.

No endpoint URL changes — `/subscriptionType/all` simply exposes the new attribute.

### 2. New card + visual polish (UserProfile subscription section)
Add the fifth card:
- Icon: `Camera` (lucide-react), accent `violet` (`text-violet-600`, `border-violet-100`) — distinct from existing emerald/teal/cyan/orange.
- Label: "Process Images" / sublabel: "Image ingredient scans".
- Value: `currentSubscriptionInfo?.processImages || 0` over `currentSubscriptionType.processImages`.

5-card grid redesign:
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3`. On lg all 5 in one row; on sm 3 + 2; on mobile 2 per row with the 5th spanning full width.
- Unified card style: subtle gradient (`bg-gradient-to-br from-{color}-50 to-white`), soft border, `rounded-xl`, `hover:shadow-md hover:-translate-y-0.5 transition`.
- Header: icon in a tinted circular badge (`h-9 w-9 rounded-full bg-{color}-100`); value/limit right-aligned (`text-2xl font-bold` over muted limit).
- Thin usage progress bar at the bottom of each card (1.5px, accent color) showing `remaining / limit`.
- Normalize paddings to `p-4`, label `text-sm font-medium`, sublabel `text-xs text-muted-foreground`.

### 3. i18n
Add new keys to `src/contexts/LanguageContext.tsx` for EN, ES, PT using the existing flat dot-notation pattern:
- `profile.processImages`
- `profile.processImagesDesc`

## Out of scope
- No backend/endpoint changes.
- No changes to the analyze-image flow itself.
- Native (Capacitor) reader-app restrictions unchanged — profile usage display only, no commerce.

## Files touched
- `src/components/UserProfile.tsx`
- `src/contexts/SubscriptionContext.tsx`
- `src/contexts/LanguageContext.tsx`
- `src/utils/mapSubscriptionPlans.ts`
- `src/services/payments.ts`
- `src/components/SubscriptionManager.tsx`
- `src/components/SubscriptionPurchase.tsx`