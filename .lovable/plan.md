# Async Healthy Drink Generation (jobId + websocket)

Mirror the meal plan async flow for healthy drinks. The drink endpoint now returns `{ jobId }`; results arrive via socket `generationCompleted`/`generationFailed` on the job room.

## Changes

### 1. `src/services/drinkService.ts`
- Add `createHealthyDrinkJob(data)` → POST `/meal-plan/healthy-drink`, returns `{ jobId }`. Keep the same `code === "03"` subscription-limit handling.
- Keep existing `createHealthyDrink` for backwards compat.

### 2. Reuse `connectJobSocket` from `mealPlanJobService`
- The backend uses the same socket gateway with shared `generationCompleted` / `generationFailed` events filtered by `jobId`, so no new socket service file is needed.

### 3. `src/contexts/DrinkJobContext.tsx` (new)
- Same shape as `MealPlanJobContext`:
  - `activeJob`, `isProcessing`, `startJob(jobId, requestData)`, `clearJob`, `readyDrink`, `dismissReadyDrink`.
  - Persists active job in `localStorage` (`pantry.activeDrinkJob`).
  - On `generationCompleted`: build the transformed drink object (same shape produced today in `AIDrinkCreatorStepper.handleGenerate`), set `readyDrink`, then `clearJob()`.
  - On `generationFailed`: error toast, clear.

### 4. `src/components/DrinkJobIndicator.tsx` (new)
- Top-center fixed loader (same styling as `MealPlanJobIndicator`) with a `GlassWater` / `CupSoda` icon + spinner and "Mixing your healthy drink…" + drink name.

### 5. `src/components/DrinkReadyModal.tsx` (new)
- Same structure as `MealPlanReadyModal`: CheckCircle + Sparkles icon, drink name, "View Drink" / "Later" buttons.
- "View Drink" dispatches `CustomEvent("open-drink", { detail: { drink } })` and calls `dismissReadyDrink()`.
- Uses translation keys: `drinkReady.title`, `drinkReady.description`, `drinkReady.viewDrink`, `drinkReady.later`.

### 6. `src/App.tsx`
- Wrap tree with `<DrinkJobProvider>` (inside `MealPlanJobProvider`).
- Render `<DrinkJobIndicator />` and `<DrinkReadyModal />` alongside the meal plan equivalents.

### 7. `src/components/AIDrinkCreatorStepper.tsx`
- Replace direct `createHealthyDrink` + transform-and-show flow with:
  - Call `createHealthyDrinkJob(requestData)` → `{ jobId }`.
  - `useDrinkJob().startJob(jobId, requestData)`.
  - Show 5s toast: "🥤 Drink Generation Started — We'll notify you when your healthy drink is ready."
  - Call `onBack()` to return user to the drinks list.
- Remove inline `setGeneratedDrink` / `setIsGenerating(true)` success path. Keep `code 03` upgrade modal on POST.

### 8. `src/components/AIDrinkGeneration.tsx`
- Same refactor: POST returns `jobId`, call `startJob`, show 5s toast, exit back to list.
- Keep existing `code === "03"` upgrade modal handling on POST.

### 9. `src/components/AIDrinkCreator.tsx`
- Add `useEffect` listening for `window.addEventListener("open-drink", ...)` → `setSelectedDrink(detail.drink)` so the user lands directly on the drink detail when they click "View Drink" in the modal.

### 10. `src/components/Dashboard.tsx`
- Add `useEffect` listening for `open-drink` → set `activeTab` to the drinks tab (mirrors the existing `open-meal-plan` handler).

### 11. Translations — `src/contexts/LanguageContext.tsx`
- All EN/ES/PT strings live in this file using flat dot-notation keys (per project memory).
- Add: `drinkReady.title`, `drinkReady.description`, `drinkReady.viewDrink`, `drinkReady.later`, and the new "drink generation started" toast title/description for the three languages.

## Technical notes
- All orchestration is frontend. No new backend calls beyond the existing `/meal-plan/healthy-drink` POST and the shared socket gateway.
- Persisting `activeJob` in `localStorage` lets the loader resume if the user reloads while generation is running.
- The transformed drink object built inside `DrinkJobContext.onCompleted` matches the shape `AIDrinkView` already consumes, so no view changes are needed.

## Files touched
- new  `src/contexts/DrinkJobContext.tsx`
- new  `src/components/DrinkJobIndicator.tsx`
- new  `src/components/DrinkReadyModal.tsx`
- edit `src/services/drinkService.ts`
- edit `src/components/AIDrinkCreatorStepper.tsx`
- edit `src/components/AIDrinkGeneration.tsx`
- edit `src/components/AIDrinkCreator.tsx`
- edit `src/components/Dashboard.tsx`
- edit `src/App.tsx`
- edit `src/contexts/LanguageContext.tsx`
