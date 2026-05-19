## Async AI Meal Generation (jobId + websocket)

Mirror the meal plan / healthy drink async flow for AI Special Meals. `POST /meal-plan/special` now returns `{ jobId }`; results arrive via the shared socket `generationCompleted` / `generationFailed` events filtered by `jobId`.

### 1. `src/services/aiMealService.ts`
- Add `createAIMealJob(payload) → { jobId }` against `POST /meal-plan/special`. Keep `code === "03"` → throw `SubscriptionLimitError`. Keep existing `createAIMeal` for backwards compat.

### 2. Reuse `connectJobSocket` from `mealPlanJobService`
- Same socket gateway, no new service file.

### 3. `src/contexts/AIMealJobContext.tsx` (new)
- Same shape as `DrinkJobContext`:
  - `activeJob`, `isProcessing`, `startJob(jobId, requestData)`, `clearJob`, `readyMeal`, `dismissReadyMeal`.
  - Persists `pantry.activeAIMealJob` in `localStorage`.
  - On `generationCompleted`: transform `payload.result` into the local meal shape currently built inside `AIMealGeneration.generateMeal` (`name`, `description`, `cookingTime`, `servings`, `difficulty`, `cuisine`, `calories`, `ingredients`, `instructions`, `nutritionalInfo`, `tags`, `benefits`, `prepTip`, `carbonFootprint`, `ingredientsList`). Set `readyMeal`, then `clearJob()`.
  - On `generationFailed`: error toast, clear.

### 4. `src/components/AIMealJobIndicator.tsx` (new)
- Top-center fixed loader (same styling as `DrinkJobIndicator` / `MealPlanJobIndicator`), `ChefHat` icon + spinner, "Cooking up your meal…" + meal name.

### 5. `src/components/AIMealReadyModal.tsx` (new)
- Same structure as `DrinkReadyModal` / `MealPlanReadyModal`: CheckCircle + Sparkles, meal name, buttons "View Meal" / "Later".
- "View Meal" dispatches `CustomEvent("open-ai-meal", { detail: { meal } })` and `dismissReadyMeal()`.
- Translation keys: `aiMealReady.title`, `aiMealReady.description`, `aiMealReady.viewMeal`, `aiMealReady.later`.

### 6. `src/App.tsx`
- Wrap tree with `<AIMealJobProvider>` (alongside `MealPlanJobProvider` and `DrinkJobProvider`).
- Render `<AIMealJobIndicator />` and `<AIMealReadyModal />`.

### 7. `src/components/AIMealCreatorStepper.tsx`
- In `handleGenerate`: call `createAIMealJob(apiPayload)` (building the same payload currently built in `AIMealGeneration.generateMeal`, so the stepper owns the request transformation).
- On success → `useAIMealJob().startJob(jobId, requestData)`, show 5s toast "🍽️ Meal Generation Started — We'll notify you when your meal is ready", then `onBack()` to return to the list.
- On `SubscriptionLimitError` → show existing upgrade modal flow (lift `SubscriptionUpgradeModal` usage from `AIMealGeneration` into the stepper, or keep a small inline copy).
- Remove `setIsGenerating(true)` success branch and the `AIMealGeneration` render path from this file (no longer needed for happy-path generation).

### 8. `src/components/AIMealGeneration.tsx`
- No longer used for in-flight generation. Either:
  - Repurpose as a pure "meal detail" view fed by an already-generated meal (drop the `generateMeal` effect and the `SubscriptionLimitError` handling), OR
  - Delete it if `AIMealView` already covers the post-generation detail view.
- Decision: keep file, strip the `useEffect`/`generateMeal` so it just renders `mealData` (no API call, no upgrade modal). This preserves any other call sites that pass a fully-formed meal.

### 9. `src/components/AIMealCreator.tsx`
- Add `useEffect` listening for `window.addEventListener("open-ai-meal", e => setSelectedMeal(e.detail.meal))` so the user lands directly on the meal detail when clicking "View Meal".
- In `handleMealCreated` (called after the job starts) just close the creator and refresh the list as today.

### 10. `src/components/Dashboard.tsx`
- Add `useEffect` listening for `open-ai-meal` → switch `activeTab` to the AI meals tab (mirrors `open-meal-plan` / `open-drink` handlers).

### 11. Translations — `src/contexts/LanguageContext.tsx`
- Add EN/ES/PT flat dot-notation keys: `aiMealReady.title`, `aiMealReady.description`, `aiMealReady.viewMeal`, `aiMealReady.later`, `aiMealStarted.title`, `aiMealStarted.description`, plus indicator label `aiMealJob.processing`.

### Technical notes
- All orchestration is frontend; only existing `/meal-plan/special` POST + shared socket gateway are used.
- `localStorage` persistence lets the loader resume on reload.
- The transformed meal object built in `AIMealJobContext.onCompleted` matches the shape `AIMealView` already consumes via `setSelectedMeal`, so no view changes are needed.
- Subscription-limit (`code === "03"`) handling stays synchronous on the POST response, before the job is registered.

### Files touched
- new  `src/contexts/AIMealJobContext.tsx`
- new  `src/components/AIMealJobIndicator.tsx`
- new  `src/components/AIMealReadyModal.tsx`
- edit `src/services/aiMealService.ts`
- edit `src/components/AIMealCreatorStepper.tsx`
- edit `src/components/AIMealGeneration.tsx`
- edit `src/components/AIMealCreator.tsx`
- edit `src/components/Dashboard.tsx`
- edit `src/App.tsx`
- edit `src/contexts/LanguageContext.tsx`
