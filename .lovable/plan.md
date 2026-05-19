## Background

The `POST /meal-plan` endpoint now returns `{ jobId: "..." }` instead of the full plan. Generation happens asynchronously and results are pushed over Socket.IO. The UI must:

1. Send the create request, receive `jobId`, and persist the in-flight job.
2. Open a Socket.IO connection, join the job room, and listen for `generationCompleted` / `generationFailed`.
3. Show a non-blocking "Meal plan in progress" loader that lets the user keep navigating.
4. When `generationCompleted` arrives, show the resulting plan exactly like today (success modal + insert into context + refresh list).

## Changes

### 1. Dependency
- Add `socket.io-client`.

### 2. Env var
- Add `VITE_SOCKET_URL` (defaults to `ws://localhost:3001`, prod will be set later) read by the new service.

### 3. New service `src/services/mealPlanJobService.ts`
- `createMealPlanJob(planData) -> Promise<{ jobId }>`: POSTs to `${VITE_PANTRY_URL}/meal-plan`, returns `{ jobId }`.
- `connectJobSocket(jobId, handlers)`: creates a `socket.io-client` connection to `VITE_SOCKET_URL`, on `connect` emits `joinJobRoom` with `{ jobId }`, wires `generationCompleted` and `generationFailed`, returns a `disconnect()` cleanup.
- Helper `transformJobResultToApiMealPlan(jobResult, requestData, jobId)` to map the socket `result` payload (which contains `mealPlan`, `ingredientsList`, `totalCarbonFootprint`) into the shape `transformApiMealPlanToLocal` already expects (synthesize `_id` from `jobId`, copy `plan_name`, `start_date`, `duration`, `numberPeople`, etc. from the original request, and put the socket `result` into `plan`).

### 4. New context `src/contexts/MealPlanJobContext.tsx`
Global, mounted in `App.tsx` inside `UserProvider`. Responsibilities:
- State: `activeJob: { jobId, planName, requestData, startedAt } | null`, `status: 'idle' | 'processing' | 'completed' | 'failed'`.
- Persist `activeJob` in `localStorage` so a page refresh resumes the socket.
- On `activeJob` change, open the socket via `connectJobSocket`, emit `joinJobRoom`.
- On `generationCompleted`: transform result, call `userContext.addMealPlan` (or equivalent existing setter) + `refreshMealPlans()`, fire a success toast, set status `completed`, clear `activeJob`.
- On `generationFailed`: toast error, clear `activeJob`.
- Exposes: `startJob(jobId, requestData)`, `activeJob`, `isProcessing`.

### 5. Floating progress indicator `src/components/MealPlanJobIndicator.tsx`
- Rendered globally (e.g. in `AppContent` after `<Routes>`).
- When `isProcessing`, shows a small fixed-bottom-right card with a spinner + "Creating your meal plan…" + plan name. Uses brand emerald tokens. Allows the user to keep navigating (no overlay).
- Hidden when idle.

### 6. Update `MealPlanCreatorStepper.tsx` and `MealPlanCreator.tsx`
Replace the current `await createMealPlan(requestData)` + immediate transform / success-modal flow with:
- Call `createMealPlanJob(requestData)` → get `jobId`.
- Call `mealPlanJobContext.startJob(jobId, requestData)`.
- `hideLoader()`, toast "Meal plan generation started — we'll notify you when it's ready", then `onBack()` so the user returns to the dashboard.
- Remove the inline `showSuccessModal` triggering here (the global context handles completion). Keep error handling for the synchronous POST (subscription code "03", network errors).

### 7. Keep existing display path
- `transformApiMealPlanToLocal` and `UserContext.refreshMealPlans` remain unchanged — completion handler uses them, so meal plans render exactly as today.

## Technical notes

- Socket auth: none specified by the user; connect with default options. If the server later requires the bearer token, pass it through `auth: { token }` in `io(url, { auth })`.
- Reconnection: rely on socket.io-client defaults; on `connect` always re-emit `joinJobRoom` (covers reconnect mid-generation).
- Only one active job at a time is supported (single slot in context). If a second job starts, it replaces the first.
- Cleanup: disconnect socket on completion/failure and on `activeJob` cleared.

## Files

- add: `src/services/mealPlanJobService.ts`
- add: `src/contexts/MealPlanJobContext.tsx`
- add: `src/components/MealPlanJobIndicator.tsx`
- edit: `src/App.tsx` (wrap with provider, mount indicator)
- edit: `src/components/MealPlanCreatorStepper.tsx` (job flow)
- edit: `src/components/MealPlanCreator.tsx` (job flow)
- edit: `package.json` (`socket.io-client`)
