# Refine async meal plan flow: toast → top loader → ready modal → navigate

## Goal
Replace the persistent "generation started" toast with a short-lived toast, show a top-center in-progress loader while the job runs, and on `generationCompleted` show a "Meal Plan Ready" modal with a button that navigates the user into the generated plan (Recipe + Shopping List view).

## Changes

### 1. Toast duration on job start
**Files:** `src/components/MealPlanCreatorStepper.tsx`, `src/components/MealPlanCreator.tsx`

- Set the "Meal Plan Generation Started" toast `duration: 5000` (5s) instead of 6s/sticky.
- Keep `startJob(jobId, requestData)` and immediate return to dashboard.

### 2. Move loader from bottom-right to top-center
**File:** `src/components/MealPlanJobIndicator.tsx`

- Reposition to `fixed top-4 left-1/2 -translate-x-1/2 z-50` with safe-area padding.
- Keep emerald gradient card, ChefHat + Loader2 spinner, "Cooking your meal plan…" + plan name.
- Stays visible the entire time `isProcessing` is true (from `useMealPlanJob`).

### 3. Ready modal triggered by socket completion
**New file:** `src/components/MealPlanReadyModal.tsx`

- Reusable Dialog: CheckCircle + Sparkles icon, title "Your Meal Plan is Ready!", plan name, two buttons:
  - **View Meal Plan** → calls `onView(plan)`
  - **Later** → closes modal.
- Multilingual strings via `useLanguage` (EN/ES/PT keys: `mealPlanReady.title`, `mealPlanReady.description`, `mealPlanReady.viewPlan`, `mealPlanReady.later`).

### 4. Wire completion → modal → navigation
**File:** `src/contexts/MealPlanJobContext.tsx`

- Add `readyPlan` state (the transformed local plan) and `dismissReadyPlan()` to context value.
- In `onCompleted`: after `addMealPlan(localPlan)` + `refreshMealPlans()`, set `readyPlan = localPlan`, drop the existing success toast (replaced by modal), then `clearJob()` so the top loader disappears.
- Keep failure toast as-is.

**File:** `src/App.tsx`

- Render `<MealPlanReadyModal />` alongside `<MealPlanJobIndicator />` inside the provider.
- Modal reads `readyPlan` from `useMealPlanJob`. On "View Meal Plan":
  - Set the selected meal plan in `UserContext` (use existing `setSelectedMealPlan` / equivalent already used after creating a plan).
  - Navigate to the meal plan detail route (the same destination `MealPlanView` uses today — the dashboard "Meal Plans" tab opening the plan, mirroring current post-creation behavior).
  - Call `dismissReadyPlan()`.

### 5. Translations
**Files:** `src/translations/en.ts`, `es.ts`, `pt.ts`

- Add keys for `mealPlanReady.*` (title, description, viewPlan, later) and update the "started" toast copy if needed.

## Technical notes
- No backend changes; purely frontend orchestration around existing socket events.
- Loader and modal both driven by `MealPlanJobContext` so they work even if user navigates away from the creator while the job runs.
- Reuse the existing navigation pattern used when a plan is created synchronously today (look up in `MealPlanCreatorStepper.onPlanCreated` callsite to mirror the same `setActiveTab` / route change).

## Files touched
- edit `src/components/MealPlanJobIndicator.tsx`
- edit `src/contexts/MealPlanJobContext.tsx`
- edit `src/components/MealPlanCreatorStepper.tsx`
- edit `src/components/MealPlanCreator.tsx`
- edit `src/App.tsx`
- edit `src/translations/{en,es,pt}.ts`
- new  `src/components/MealPlanReadyModal.tsx`
