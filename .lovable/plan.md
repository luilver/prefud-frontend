## Goal
Rename app display brand to **Prefud** AND change iOS/Android bundle identifiers from `com.bessel.mypantryapp` to **`com.bessel.prefud`**. Leave route paths, code identifiers, backend URLs, and the kitchen "pantry" feature concept untouched.

> If you want a different bundle id (e.g. `com.prefud.app`), tell me before approving and I'll swap the value.

## Scope: what changes

### 1. Bundle identifiers → `com.bessel.prefud`
- `capacitor.config.ts` → `appId: "com.bessel.prefud"`, `appName: "Prefud"`
- iOS `ios/App/App.xcodeproj/project.pbxproj` → both `PRODUCT_BUNDLE_IDENTIFIER = com.bessel.prefud;` entries (Debug + Release)
- Android `android/app/build.gradle` → `namespace = "com.bessel.prefud"` and `applicationId "com.bessel.prefud"`
- Android `android/app/src/main/res/values/strings.xml` → `package_name` and `custom_url_scheme` = `com.bessel.prefud`
- Android Java package rename: move `android/app/src/main/java/com/bessel/pantryapp/MainActivity.java` → `android/app/src/main/java/com/bessel/prefud/MainActivity.java` and update its `package com.bessel.prefud;` declaration

### 2. Native app display name (iOS & Android)
- `ios/App/App/Info.plist` → `CFBundleDisplayName` = `Prefud`
- `android/app/src/main/res/values/strings.xml` → `app_name` = `Prefud`, `title_activity_main` = `Prefud`

### 3. Web metadata
- `index.html` → `<title>Prefud - Your Smart Kitchen Companion</title>`

### 4. UI components (visible brand text)
- `src/components/Navigation.tsx` sidebar "Pantry" → "Prefud"
- `src/components/Dashboard.tsx` (~line 235) "Pantry" → "Prefud"
- `src/components/ui/Header.tsx` "MealGenius" → "Prefud"
- `src/pages/Landing.tsx` brand mentions → "Prefud"

### 5. Translations — brand mentions only (EN/ES/PT)
Replace brand "Pantry" with "Prefud" in `src/translations/en.ts`, `es.ts`, `pt.ts`: hero titles, testimonials, footer, `whyPantry` body copy, terms intro, `freePlanDescription`, landing strings ("How Pantry Works" → "How Prefud Works", "Pantry uses AI…" → "Prefud uses AI…", etc.).
**Not touched:** feature keys/copy `addToPantry`, `addedToPantry`, "Add to Pantry", "Agregar a la Despensa", "Adicionar à Despensa" — these refer to the kitchen pantry feature.

## Out of scope
- Route paths (`/why-pantry`), component/file names (`WhyPantry`, `PantryMealsJobContext`, `pantryService`, `pantryItems`)
- Backend service URLs, env vars, API endpoints
- Feature-level "pantry" language

## Required user actions after merge
Changing the bundle id has real consequences — please be aware:

1. Run locally:
   ```
   npx cap sync ios && npx cap sync android
   ```
2. **App Store / Play Store:** a new `applicationId` / bundle id is treated as a **new app**. The existing listing (if any) cannot be updated with this build; you'll need a new listing or to revert to the old id.
3. **Signing & Firebase / GoogleService-Info.plist / google-services.json:** these are tied to the old bundle id. You must regenerate/replace them for `com.bessel.prefud` or the app will fail at runtime (Firebase, push, OAuth callbacks). I'm not touching `ios/App/App/GoogleService-Info.plist` — you'll need to download a new one.
4. **RevenueCat / IAP product configuration:** subscriptions are scoped to the bundle id. You'll need to recreate or remap them under the new id.
5. **Deep-link / OAuth redirect schemes** that reference `com.bessel.mypantryapp` outside this repo (e.g. provider dashboards) must be updated to `com.bessel.prefud`.
6. iOS users on the old app won't auto-upgrade — the new bundle id installs as a separate app.

## Verification
- Build succeeds; TypeScript clean.
- Grep shows no remaining `com.bessel.mypantryapp` and no brand "Pantry"/"MealGenius" strings in UI/translations.
- `strings.xml`, `Info.plist`, `build.gradle`, and `project.pbxproj` show `Prefud` / `com.bessel.prefud`.
- Android `MainActivity.java` lives at `…/java/com/bessel/prefud/MainActivity.java` with matching `package` declaration.
