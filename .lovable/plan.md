## Async Pantry Meal Suggestions (jobId + websocket)

Mirror the meal plan / drink / AI meal async flow for the "Tap to generate meals" feature in `AIMealSuggestions`. `POST /meal-plan/generateMeals` now returns `{ jobId }`; the array of suggested meals arrives later via socket `generationCompleted` / `generationFailed`.

### 1. `src/services/pantryService.ts`
- Add `generateMealsFromPantryJob(userId, startDate, servings, language) → { jobId }` against `POST /meal-plan/generateMeals`.
- Keep `code === "02"` (no ingredients) and `code === "03"` (subscription limit) handled synchronously on the POST response (throw tagged errors so the caller can show the existing destructive toasts).
- Keep existing `generateMealsFromPantry` for backwards compat.

### 2. Reuse `connectJobSocket` from `mealPlanJobService`
- Same socket gateway, filtered by `jobId`. No new service file.

### 3. `src/contexts/PantryMealsJobContext.tsx` (new)
- Same shape as `AIMealJobContext`:
  - `activeJob` (persisted in `localStorage` as `pantry.activePantryMealsJob`), `isProcessing`, `startJob(jobId, requestData)`, `clearJob`, `readyMeals: any[] | null`, `dismissReadyMeals`.
  - On `generationCompleted`: transform `payload.result.generatedMeals` using the same mapping currently inside `AIMealSuggestions.generateSuggestions` (id, name, description, prepTime, calories, type, benefits, prepTip, carbonFootprint, ingredients, steps, nutritionalInfo, instructions). Stash `totalCarbonFootprint` on the array via a context-scoped state for the toast/modal subtitle. Then `clearJob()`.
  - On `generationFailed`: error toast, clear.

### 4. `src/components/PantryMealsJobIndicator.tsx` (new)
- Top-center fixed loader (same styling as the others) with `Sparkles` + spinner and "Cooking up meal ideas from your pantry…".

### 5. `src/components/PantryMealsReadyModal.tsx` (new)
- Same structure as `AIMealReadyModal`: CheckCircle + Sparkles, "Your pantry meals are ready!", count line ("N meals generated"), buttons "View Meals" / "Later".
- "View Meals" dispatches `CustomEvent("open-pantry-meals", { detail: { meals } })` and `dismissReadyMeals()`.
- Translation keys: `pantryMealsReady.title`, `pantryMealsReady.description`, `pantryMealsReady.viewMeals`, `pantryMealsReady.later`.

### 6. `src/App.tsx`
- Wrap tree with `<PantryMealsJobProvider>` (alongside other job providers).
- Render `<PantryMealsJobIndicator />` and `<PantryMealsReadyModal />`.

### 7. `src/components/AIMealSuggestions.tsx`
- In `generateSuggestions`:
  - Call `generateMealsFromPantryJob(...)` → `{ jobId }`.
  - Keep `code === "02"` / `code === "03"` synchronous toast handling (now via tagged errors thrown from the service).
  - On success → `usePantryMealsJob().startJob(jobId, { userId, startDate, servings, language })`, show 5s toast "🍽️ Meal Generation Started — We'll notify you when your meal ideas are ready", `hideLoader()`, `setIsGenerating(false)`, close the servings modal.
- Add `useEffect` listening for `window.addEventListener("open-pantry-meals", ...)` → `setSuggestions(detail.meals)` so the suggestion list appears inline as today when the user returns to the pantry tab.

### 8. `src/components/Dashboard.tsx`
- Add `useEffect` listening for `open-pantry-meals` → set `activeTab` to `"ingredients"` (mirrors `open-ai-meal` / `open-drink` handlers). The event also fires when the user is already on the tab — that's a no-op.

### 9. Translations — `src/contexts/LanguageContext.tsx`
- Add EN/ES/PT flat dot-notation keys: `pantryMealsReady.title`, `pantryMealsReady.description`, `pantryMealsReady.viewMeals`, `pantryMealsReady.later`, `pantryMealsStarted.title`, `pantryMealsStarted.description`.

### Technical notes
- All orchestration is frontend; only the existing `/meal-plan/generateMeals` POST + shared socket gateway are used.
- `localStorage` persistence lets the indicator resume on reload.
- `code === "02"` / `code === "03"` keep their current destructive-toast UX, raised synchronously from the POST so no job is registered.
- The mapping built in `PantryMealsJobContext.onCompleted` matches the shape `AIMealSuggestions` already renders, so the inline suggestion cards render unchanged.

### Files touched
- new  `src/contexts/PantryMealsJobContext.tsx`
- new  `src/components/PantryMealsJobIndicator.tsx`
- new  `src/components/PantryMealsReadyModal.tsx`
- edit `src/services/pantryService.ts`
- edit `src/components/AIMealSuggestions.tsx`
- edit `src/components/Dashboard.tsx`
- edit `src/App.tsx`
- edit `src/contexts/LanguageContext.tsx`
