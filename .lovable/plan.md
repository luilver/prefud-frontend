## Analyze Image → Detected Ingredients (async jobId + socket)

Add a "Scan with camera" entry point at the top of the Add Ingredient modal that lets the user take a photo or upload one, sends it as base64 to `POST /meal-plan/analyze-image`, and processes the returned `jobId` through the same socket gateway as the other async flows.

### 1. `src/services/pantryService.ts`
- Add `analyzeImageJob(userId, base64Image) → { jobId }`:
  - POST `${BASE_URL}/meal-plan/analyze-image` with `{ user_id, image }`.
  - Strip any `data:image/...;base64,` prefix before sending.
  - Send `Authorization: Bearer <token>` header when `localStorage.getItem("authToken")` exists.
  - Throw on missing `jobId`.

### 2. `src/contexts/AnalyzeImageJobContext.tsx` (new)
- Same shape as `PantryMealsJobContext`: `activeJob` persisted in `localStorage` (`pantry.activeAnalyzeImageJob`), `isProcessing`, `startJob(jobId)`, `clearJob`, `readyIngredients: PantryIngredient[] | null`, `dismissReadyIngredients`.
- Subscribes via `connectJobSocket(jobId)` (existing shared gateway, same three events).
- `onCompleted`: `payload.result` is already an array of `PantryIngredient`-shaped objects (`name, quantity, unit, category, purchased, purchaseDate, carbonFootPrintToWaste, daysToExpire, expiryDate, notes`). Stash array → `readyIngredients`, then `clearJob()`. If empty array, toast "No ingredients detected" and clear.
- `onFailed`: destructive toast, clear.

### 3. `src/components/AnalyzeImageJobIndicator.tsx` (new)
- Top-center fixed loader (same style as the others), `Camera` + spinner, "Analyzing your image…".

### 4. `src/components/AnalyzeImageReadyModal.tsx` (new)
- Dialog showing the detected list with checkboxes (all selected by default), name, quantity + unit, category, expiry date.
- Buttons:
  - "Add Selected to Pantry" → assigns ids and calls `addIngredientsToPantry(user.id, selected)`, then dispatches `CustomEvent("pantry:ingredients-added", { detail: { ingredients: selected } })` and `dismissReadyIngredients()`.
  - "Cancel" → `dismissReadyIngredients()`.
- Translation keys: `analyzeImageReady.*`.

### 5. `src/components/AnalyzeImageCapture.tsx` (new)
- Inline panel rendered above the form rows when the user taps "Scan with camera".
- Two buttons:
  - "Take Photo" → hidden `<input type="file" accept="image/*" capture="environment">`.
  - "Upload Photo" → hidden `<input type="file" accept="image/*">`.
- On file picked: read as data URL, show small preview, "Analyze" button to confirm. On confirm: convert to pure base64, call `analyzeImageJob(user.id, base64)` → `startJob(jobId)`, show 5s toast "Image Analysis Started — We'll notify you when ingredients are detected", then call `onClose()` to close the parent Add Ingredient modal.
- Loading state with spinner while POST is in flight.

### 6. `src/components/AddIngredientForm.tsx`
- Add a primary "Scan ingredients with camera" button at the top (above the first ingredient row, full-width, emerald gradient with `Camera` icon).
- Add state `showAnalyzeImage`. When true, render `AnalyzeImageCapture` in place of the form (mirrors existing `showCamera` / `CameraProductScanner` pattern).
- `AnalyzeImageCapture` receives `onClose={() => setShowAnalyzeImage(false)}` and `onJobStarted={onClose}` so the whole Add Ingredient dialog closes once the job is queued.
- Translation keys: `addIngredient.scanWithCamera`, `addIngredient.scanWithCameraDesc`.

### 7. `src/components/IngredientTracker.tsx`
- Add `useEffect` listener for `pantry:ingredients-added` → refresh local pantry list (re-run the same fetch the component already uses on mount, e.g. by bumping a `refreshKey` or calling the existing loader).

### 8. `src/App.tsx`
- Wrap tree with `<AnalyzeImageJobProvider>` alongside the other job providers.
- Render `<AnalyzeImageJobIndicator />` and `<AnalyzeImageReadyModal />`.

### 9. Translations — `src/contexts/LanguageContext.tsx`
- EN / ES / PT flat dot-notation keys:
  - `addIngredient.scanWithCamera`, `addIngredient.scanWithCameraDesc`, `addIngredient.takePhoto`, `addIngredient.uploadPhoto`, `addIngredient.analyzePhoto`
  - `analyzeImageStarted.title`, `analyzeImageStarted.description`
  - `analyzeImageReady.title`, `analyzeImageReady.description`, `analyzeImageReady.addSelected`, `analyzeImageReady.cancel`, `analyzeImageReady.noneDetected`, `analyzeImageReady.selectedCount`

### Technical notes
- The endpoint expects raw base64 (no `data:` prefix); the service strips it.
- `Authorization: Bearer …` is sent only when `authToken` exists in `localStorage`; falls back to no header to stay consistent with the rest of `pantryService` calls.
- Reuses the existing `connectJobSocket`; no new socket file.
- `payload.result` is already in `PantryIngredient` shape — pass straight to `addIngredientsToPantry`.
- Job persisted in `localStorage` so the indicator resumes on reload.
- Capture via `<input type="file" capture="environment">` works on iOS/Android Capacitor and web without requiring `getUserMedia` plumbing; matches the project's mobile-first constraint.

### Files touched
- new  `src/services/pantryService.ts` (added export)
- new  `src/contexts/AnalyzeImageJobContext.tsx`
- new  `src/components/AnalyzeImageJobIndicator.tsx`
- new  `src/components/AnalyzeImageReadyModal.tsx`
- new  `src/components/AnalyzeImageCapture.tsx`
- edit `src/components/AddIngredientForm.tsx`
- edit `src/components/IngredientTracker.tsx`
- edit `src/App.tsx`
- edit `src/contexts/LanguageContext.tsx`
